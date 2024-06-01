import { Inject, Injectable, HostListener, OnDestroy } from "@angular/core";
import { UteCoreConfigs } from "../interfaces/config";
import { ResizeService } from "./resize.service";
import { UteObjects } from "../interfaces/object";
import { UteFileFormats, UteFileOptions } from "../interfaces/file";
import { v4 } from "uuid";
import Compressor from "compressorjs";
import { CookieService } from "./cookie.service";
import { Capacitor } from "@capacitor/core";
import { OnlineStatusService } from "ngx-online-status";
import { HttpService } from "./http.service";
import { Observable, Subscription, map } from "rxjs";
import { LangService } from "./lang.service";
import { DateFormat, UteProvidersData } from "../interfaces/moment";
import { BreakpointObserver } from "@angular/cdk/layout";

@Injectable({
    providedIn: "root",
})
export class CoreService implements OnDestroy {
    private subscriptions = new Subscription();

    constructor(
        @Inject("UteCoreConfig") private config: UteCoreConfigs,
        private resizeService: ResizeService,
        private cookieService: CookieService,
        private onlineStatusService: OnlineStatusService,
        private httpService: HttpService,
        private langService: LangService,
        private breakpoints: BreakpointObserver
    ) {
        this.Init();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    /**
     * Initialization module
     */
    private Init() {
        console.log("CoreService - Init");
        // console.log(`${new Date().toISOString()} => CoreService`);

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
                this.config.environment.online = this.onlineStatusService.getStatus() == 1 ? true : false;
                this.subscriptions.add(this.isMobile().subscribe((status: boolean) => (this.config.environment.mobile = status)));
            }
        }
        this.cookieService.Init(this.config.environment, this.config.cookiesExp);
        this.httpService.Init(this.config.environment);
        this.langService.Init(this.config.environment, this.config);
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
     * @param update - Object with new data
     * @param fieldKey - If `source` is array, all array items similar with `update` by this key will be updated
     * @param noEmpty - Not update keys if update values are empty
     * @param update - Ignore objects diff sizes or cut final object by fileds const
     * @returns
     */
    public objectUpdate<T>(source: T, update: UteObjects, options?: { fieldKey?: string; noEmpty?: boolean; ignore?: boolean | UteObjects }): T {
        let resource: T = JSON.parse(JSON.stringify(source));
        console.log("resource", resource);
        try {
            let updater = (s: any, u: UteObjects) => {
                for (const key in u) {
                    if ((s && s.hasOwnProperty(key)) || options?.ignore) {
                        if (typeof s[key] === "object" && !Array.isArray(s[key])) {
                            s[key] = updater(s[key], u[key]);
                        } else {
                            if (options?.noEmpty) {
                                if (u[key] !== null && u[key] !== undefined) {
                                    s[key] = u[key];
                                }
                            } else {
                                s[key] = u[key];
                            }
                        }
                    }
                }

                return s;
            };
            if (Array.isArray(resource)) {
                let index: number = resource.map((x: any) => (options?.fieldKey ? x[options?.fieldKey] : x["id"])).indexOf(options?.fieldKey ? update[options?.fieldKey] : update["id"]);
                if (index != -1) {
                    resource[index] = updater(resource[index], update);
                }
            } else {
                resource = updater(resource, update);
            }

            if (typeof options?.ignore === "object") {
                resource = this.objToInt(resource, options?.ignore);
            }

            console.log("resource", resource);

            return resource;
        } catch (error) {
            console.error(error);

            return source;
        }
    }

    /**
     * Adaptation object keys to interface
     * @param item - Object to change
     * @param constArray - Interface
     * @returns New object
     */
    public objToInt(item: any, constArray: any): any {
        let removeKeys: string[] = Object.keys(item).filter((k: string) => !Object.keys(constArray).some((p: any) => p === k));

        removeKeys.map((k: string) => {
            delete item[k];
        });

        return item;
    }

    /**
     *
     * @param file
     * @param options
     * @returns
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
     * Update app online status
     */
    public checkOnline() {
        this.config.environment.online = this.onlineStatusService.getStatus() == 1 ? true : false;
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

    // /**
    //  * Generate additional formats for moment adapter
    //  * @param format - User default date format
    //  * @returns Object with additional formats
    //  */
    // public momentProviders(format: string): UteProvidersData {
    //     const defaultFormat: DateFormat = {
    //         parse: {
    //             dateInput: "LL",
    //         },
    //         display: {
    //             dateInput: "LL",
    //             monthYearLabel: "MMM YYYY",
    //             dateA11yLabel: "LL",
    //             monthYearA11yLabel: "MMMM YYYY",
    //         },
    //     };

    //     const dateRegx: RegExp = /(d{1,2}\W{0,1}m{1,5}\W{0,1}y{1,4})/gi;

    //     // Full DateTime
    //     format = format.replace(/y{2}/gi, format.includes("Y") ? "YYYY" : "yyyy");

    //     // Short DateTime
    //     let dateTimeFormat: string = JSON.parse(JSON.stringify(format));
    //     dateTimeFormat = dateTimeFormat.replace(/m{3,5}/gi, format.includes("M") ? "MM" : "mm");
    //     dateTimeFormat = dateTimeFormat.replace(/y{3,4}/gi, format.includes("Y") ? "YY" : "yy");

    //     // Full Date
    //     let match = format.match(dateRegx);
    //     let dateFormat: string = match ? match[0] : "";

    //     // Short Date
    //     match = dateTimeFormat.match(dateRegx);
    //     let shortFormat: string = match ? match[0] : "";

    //     const fullDateTime: DateFormat = this.objectUpdate<DateFormat>(defaultFormat, {
    //         parse: {
    //             dateInput: format,
    //         },
    //         display: {
    //             dateInput: format,
    //         },
    //     });

    //     const shortDateTime: DateFormat = this.objectUpdate<DateFormat>(defaultFormat, {
    //         parse: {
    //             dateInput: dateTimeFormat,
    //         },
    //         display: {
    //             dateInput: dateTimeFormat,
    //         },
    //     });

    //     const fullDate: DateFormat = this.objectUpdate<DateFormat>(defaultFormat, {
    //         parse: {
    //             dateInput: dateFormat,
    //         },
    //         display: {
    //             dateInput: dateFormat,
    //         },
    //     });

    //     const shortDate: DateFormat = this.objectUpdate<DateFormat>(defaultFormat, {
    //         parse: {
    //             dateInput: shortFormat,
    //         },
    //         display: {
    //             dateInput: shortFormat,
    //         },
    //     });

    //     const providers: UteProvidersData = {
    //         fullDateTime: fullDateTime,
    //         shortDateTime: shortDateTime,
    //         fullDate: fullDate,
    //         shortDate: shortDate,
    //     };

    //     return providers;
    // }
}
