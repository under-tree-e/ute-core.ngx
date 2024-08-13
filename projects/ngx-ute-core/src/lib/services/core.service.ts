import { Inject, Injectable, OnDestroy, afterNextRender } from "@angular/core";
import { UteCoreConfigs } from "../interfaces/config";
import { ResizeService } from "./resize.service";
import { UteObjects } from "../interfaces/object";
import { UteFileFormats, UteFileOptions } from "../interfaces/file";
import { v4 } from "uuid";
import Compressor from "compressorjs";
import { CookieService } from "./cookie.service";
import { Capacitor } from "@capacitor/core";
import { HttpService } from "./http.service";
import { Observable, Subscription, map } from "rxjs";
import { LangService } from "./lang.service";
import { BreakpointObserver } from "@angular/cdk/layout";
import { PageService } from "./page.service";
import { DOCUMENT } from "@angular/common";

@Injectable({
    providedIn: "root",
})
export class CoreService implements OnDestroy {
    private subscriptions = new Subscription();

    constructor(
        @Inject("UteCoreConfig") private config: UteCoreConfigs,
        @Inject(DOCUMENT) private document: Document,
        private resizeService: ResizeService,
        private cookieService: CookieService,
        private httpService: HttpService,
        private langService: LangService,
        private breakpoints: BreakpointObserver,
        private pageService: PageService
    ) {
        console.log(101.1);

        if (!globalThis["document"]) {
            globalThis["document"] = this.document;
        }

        if (!globalThis["localStorage"]) {
            globalThis["localStorage"] = this.document.defaultView?.localStorage!;
        }

        if (!globalThis["window"]) {
            globalThis["window"] = this.document.defaultView!;
        }

        if (!globalThis["location"]) {
            globalThis["location"] = this.document.defaultView?.location!;
        }
        console.log(101.2);

        this.Init();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    /**
     * Initialization module
     */
    public Init() {
        console.log(101.3);

        if (!this.config.environment.production) {
            console.log(`${new Date().toISOString()} => CoreService`);
        }

        if (this.config) {
            if (this.config.resizer) {
                this.resizeService.Init(this.config.customFontSizes || undefined);
            }
            if (this.config.environment) {
                let platform: string = Capacitor.getPlatform();
                if (platform === "web") {
                    platform = this.isWebBrowser(platform);
                }

                this.config.environment.platform = platform;
                afterNextRender(() => {
                    this.checkOnline();
                });
                this.subscriptions.add(this.isMobile().subscribe((status: boolean) => (this.config.environment.mobile = status)));
            }
        }

        this.cookieService.Init(this.config.environment, this.config.cookiesExp);
        console.log(101.4);

        this.httpService.Init(this.config.environment);
        this.langService.Init(this.config.environment, this.config);
        this.pageService.Init(this.config.environment, this.config.pages);
    }

    /**
     * Check if app is web platform or browser instance
     * @returns status
     */
    private isWebBrowser(platform: string): string {
        if (typeof navigator === "object" && typeof navigator.userAgent === "string") {
            if (/android/i.test(navigator.userAgent)) {
                return "android";
            }

            if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                return "ios";
            }

            if (/Electron/.test(navigator.userAgent)) {
                return "electron";
            }
        }
        return platform;
    }

    /**
     * Update Object of Array of objects
     * @param source - Object or Array of objects
     * @param target - Object with new data
     * @param key - (`source` is array) Key to search object in array
     * @param noEmpty - Not update keys if `target` values are empty
     * @param resize - Add new keys from `target` to `source` object
     * @param cut - Interface keys array to remove redundent keys from object
     * @returns Object or Array of objects
     */
    public toObject<T>(
        source: T,
        target: UteObjects,
        options?: {
            key?: string;
            noEmpty?: boolean;
            resize?: boolean;
            cut?: UteObjects;
        }
    ): T {
        // Dublicate source to prevert original changes
        let resource: T = JSON.parse(JSON.stringify(source));

        try {
            let updater = (s: any, u: UteObjects) => {
                for (const k in u) {
                    if ((s && s.hasOwnProperty(k)) || options?.resize) {
                        if (s[k] && typeof s[k] === "object" && !Array.isArray(s[k])) {
                            s[k] = updater(s[k], u[k]);
                        } else {
                            if (options?.noEmpty) {
                                if (u[k] !== null && u[k] !== undefined) {
                                    s[k] = u[k];
                                }
                            } else {
                                s[k] = u[k];
                            }
                        }
                    }
                }
                return s;
            };

            if (Array.isArray(resource)) {
                if (options?.key) {
                    let index: number = resource.map((x: any) => (options?.key ? x[options?.key] : x["id"])).indexOf(options?.key ? target[options?.key] : target["id"]);
                    if (index !== -1) {
                        resource[index] = updater(resource[index], target);
                    } else {
                        resource.push(target);
                        index = resource.length - 1;
                    }
                    if (options?.cut) {
                        resource[index] = this.toInterface(resource[index], options?.cut);
                    }
                } else {
                    throw "Empty 'key' param";
                }
            } else {
                resource = updater(resource, target);
                if (options?.cut) {
                    resource = this.toInterface(resource, options?.cut);
                }
            }

            return resource;
        } catch (error) {
            console.error(error);
            return source;
        }
    }

    /**
     * Remove object keys not isset at interface
     * @param item - Object to change
     * @param interfaceConst - Interface keys array
     * @returns New object
     */
    public toInterface(item: any, interfaceConst: any): any {
        let resource: any = JSON.parse(JSON.stringify(item));

        let removeKeys: string[] = Object.keys(resource).filter((k: string) => !Object.keys(interfaceConst).some((p: any) => p === k));

        removeKeys.map((k: string) => {
            delete resource[k];
        });

        return resource;
    }

    /**
     * Load file from File Input
     * @param file - input
     * @param options - settings
     * @returns file object
     */
    public getFile(file: any, options?: UteFileOptions): Promise<any> {
        if (!options) {
            options = {} as UteFileOptions;
        }

        !options?.quality ? (options!.quality = 0.65) : null;
        !options?.maxHeight ? (options!.maxHeight = 512) : null;
        !options?.maxWidth ? (options!.maxWidth = 512) : null;
        !options?.checkOrientation ? (options!.checkOrientation = true) : null;
        !options?.multiple ? (options!.multiple = false) : null;
        !options?.uniqName ? (options!.uniqName = false) : null;

        return new Promise(async (resolve, reject) => {
            try {
                let files: any[] = [];
                let fileArray: any[] = Array.from(file.files);

                const fileReadingPromises = fileArray.map((fileData: any) => {
                    return new Promise((resolve) => {
                        let array: string[] = fileData.name.split(".");
                        let ex: string = array[array.length - 1];
                        array.splice(-1, 1);
                        let name: string = array.join(".");
                        let uid: string = v4();
                        options?.uniqName ? (name = `${name}-${uid}`) : null;

                        let type: string = "file";
                        if (UteFileFormats.images.some((format: string) => format === ex)) {
                            type = "image";
                        } else if (UteFileFormats.docs.some((format: string) => format === ex)) {
                            type = "doc";
                        }
                        if (type === "image") {
                            new Compressor(fileData, {
                                quality: options?.quality,
                                maxHeight: options?.maxHeight,
                                maxWidth: options?.maxWidth,
                                checkOrientation: options?.checkOrientation,
                                success(result) {
                                    let fileReader: FileReader = new FileReader();
                                    fileReader.onload = () => {
                                        files.push({
                                            uid: uid,
                                            type: type,
                                            name: name,
                                            ex: ex,
                                            base64: fileReader.result,
                                        });
                                        resolve(true);
                                    };
                                    fileReader.readAsDataURL(result);
                                },
                                error(error) {
                                    reject(error);
                                },
                            });
                        } else {
                            let fileReader: FileReader = new FileReader();
                            fileReader.onload = () => {
                                files.push({
                                    uid: uid,
                                    type: type,
                                    name: name,
                                    ex: ex,
                                    base64: fileReader.result,
                                });
                                resolve(true);
                            };
                            fileReader.readAsDataURL(fileData);
                        }
                    });
                });

                await Promise.all(fileReadingPromises);

                if (options?.multiple) {
                    resolve(files);
                } else {
                    resolve(files[0]);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     *
     * @param eventDate
     * @param returnDay
     * @returns
     */
    public getWeekOfMonth(eventDate: Date, returnDay: boolean = false): number {
        let d: Date = new Date(eventDate);
        let day: number = d.getDay() == 0 ? 7 : d.getDay();
        if (returnDay) {
            return day;
        }
        let date: number = d.getDate();
        let weekOfMonth: number = Math.ceil((date - day) / 7);
        return weekOfMonth;
    }

    /**
     *
     * @param date
     * @returns
     */
    public toIsoZone(date: Date | string): string {
        try {
            if (typeof date === "string") {
                date = new Date(date);
            }

            let tzo: number = -date.getTimezoneOffset();
            let dif: string = tzo >= 0 ? "+" : "-";
            let pad = (num: number) => {
                return (num < 10 ? "0" : "") + num;
            };

            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${dif}${pad(
                Math.floor(Math.abs(tzo) / 60)
            )}${pad(Math.abs(tzo) % 60)}`;
        } catch {
            return "";
        }
    }

    /**
     * Update server online status
     */
    public async checkOnline() {
        const res: any = await this.httpService.httpRequest("POST", [{ method: "online" }]);
        this.config.environment.online = res.online || false;
    }

    /**
     * Return if mobile device
     * @param custom - Custom width size
     */
    public isMobile(custom?: string): Observable<boolean> {
        return this.breakpoints.observe(`(max-width: ${custom ? custom : 860}px)`).pipe(map((breakpoint) => breakpoint.matches));
    }

    /**
     * Convert user format to one of presets
     * @param format - User default date format
     * @param type - Preset name
     * @returns New format string
     */
    public dateFormat(format: string, type: "date" | "time" | "shortdate" | "shorttime"): string {
        const dateRegx: RegExp = /(d{1,2}\W{0,1}m{1,5}\W{0,1}y{1,4})/gi;
        let value: string = JSON.parse(JSON.stringify(format));
        if (value) {
            switch (type) {
                case "date":
                    let match = value.match(dateRegx);
                    return match ? match[0].replace(/y{2,4}/gi, match[0].includes("Y") ? "YYYY" : "yyyy") : "";
                case "time":
                    return value.replace(/y{2,4}/gi, value.includes("Y") ? "YYYY" : "yyyy");
                case "shorttime":
                    value = value.replace(/m{2,5}/gi, value.includes("M") ? "MM" : "mm");
                    return value.replace(/y{2,4}/gi, value.includes("Y") ? "YY" : "yy");
                case "shortdate":
                    match = value.match(dateRegx);
                    return match ? match[0] : "";
            }
        } else {
            return format;
        }
    }
}
