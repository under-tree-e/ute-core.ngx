import { Inject, Injectable, HostListener } from "@angular/core";
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
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class CoreService {
    constructor(
        @Inject("UteCoreConfig") private config: UteCoreConfigs,
        private resizeService: ResizeService,
        private cookieService: CookieService,
        private onlineStatusService: OnlineStatusService,
        private httpService: HttpService
    ) {
        this.Init();
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
                this.config.environment.platform = Capacitor.getPlatform();
                this.config.environment.online = this.onlineStatusService.getStatus() == 1 ? true : false;
            }
        }
        this.cookieService.Init(this.config.environment, this.config.cookiesExp);
        this.httpService.Init(this.config.environment);
    }

    /**
     * Update Object of Array of objects
     * @param source - Object or Array of objects
     * @param update - Object with new data
     * @param key - If `source` is array, all array items similar with `update` by this key will be updated
     * @default `key: 'id'`
     * @returns
     */
    public objectUpdate<T>(source: T, update: UteObjects, fieldKey?: string): T {
        try {
            let updater = (s: any, u: UteObjects) => {
                for (const key in u) {
                    if (s.hasOwnProperty(key)) {
                        s[key] = u[key];
                    }
                }
                return s;
            };
            if (Array.isArray(source)) {
                let index: number = source.map((x: any) => (fieldKey ? x[fieldKey] : x["id"])).indexOf(fieldKey ? update[fieldKey] : update["id"]);
                if (index != -1) {
                    source[index] = updater(source[index], update);
                }
            } else {
                source = updater(source, update);
            }
            return source;
        } catch {
            return source;
        }
    }

    public objectInterface(item: any, constArray: any): any {
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

                await fileArray.map(async (fileData: any) => {
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
                            };
                            fileReader.readAsDataURL(result);
                        },
                        error(error) {
                            reject(error);
                        },
                    });
                });
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
     */
    public isMobile() {
        if (this.config.environment.platform === ("android" || "ios") || window.screen.width < 800) {
            return true;
        } else {
            return false;
        }
    }
}
