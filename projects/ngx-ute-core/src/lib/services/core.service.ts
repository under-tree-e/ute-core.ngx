import { Inject, Injectable } from "@angular/core";
import { UteCoreConfigs } from "../interfaces/config";
import { ResizeService } from "./resize.service";
import { UteObjects } from "../interfaces/object";
import { UteFileFormats, UteFileOptions } from "../interfaces/file";
import { v4 } from "uuid";
import Compressor from "compressorjs";
import { CookieService } from "./cookie.service";
import { Capacitor } from "@capacitor/core";
import { OnlineStatusService } from "ngx-online-status";

@Injectable({
    providedIn: "root",
})
export class CoreService {
    constructor(@Inject("UteCoreConfig") private config: UteCoreConfigs, private resizeService: ResizeService, private cookieService: CookieService, private onlineStatusService: OnlineStatusService) {
        console.log(`${new Date().toISOString()} => CoreService`);
        // console.log("CoreService");

        if (this.config) {
            if (this.config.resizer) {
                this.resizeService.Init(this.config.customFontSizes || undefined);
            }
            if (this.config.enviropment) {
                this.config.enviropment.platform = Capacitor.getPlatform();
                this.config.enviropment.online = this.onlineStatusService.getStatus() == 1 ? true : false;
            }
        }
        this.cookieService.Init(this.config.enviropment, this.config.cookiesExp);
    }

    /**
     *
     * @param source
     * @param update
     * @returns
     */
    public objectUpdate(source: UteObjects, update: UteObjects): UteObjects {
        try {
            for (const key in update) {
                if (source.hasOwnProperty(key)) {
                    source[key] = update[key];
                }
            }
            return source;
        } catch {
            return source;
        }
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
    }
}
