/* Module imports */
import { Inject, Injectable, OnDestroy } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { BreakpointObserver } from "@angular/cdk/layout";
import { v4 } from "uuid";
import Compressor from "compressorjs";
import { Capacitor } from "@capacitor/core";
import { Observable, Subscription, map } from "rxjs";
import { ActivatedRoute, NavigationEnd, NavigationStart, Router, RouterOutlet } from "@angular/router";

/* Project imports */
import { UteCoreConfigs } from "../interfaces/config";
import { UteObjects } from "../interfaces/object";
import { UteFileFormats, UteFileOptions } from "../interfaces/file";
import { CookieService } from "./cookie.service";
import { HttpService } from "./http.service";
import { LangService } from "./lang.service";
import { PageService } from "./page.service";
import { SEOService } from "./seo.service";
import { StringOptions } from "../interfaces/generator";
import { AnalyticsService } from "./analytics.service";

@Injectable({
    providedIn: "root",
})
export class CoreService implements OnDestroy {
    private readonly subscriptions = new Subscription();

    /**
     * Constructs a CoreService object.
     * @param config - The Ute Core configuration settings.
     * @param cookieService - The cookie service to use.
     * @param httpService - The HTTP service to use.
     * @param langService - The language service to use.
     * @param pageService - The page service to use.
     * @param seoService - The SEO service to use.
     * @param breakpoints - The breakpoint observer to use.
     * @param analyticsService - The analytics service to use.
     * @param router - The router to use.
     * @param activatedRoute - The activated route to use.
     * @param document - The document to use.
     */
    constructor(
        @Inject("UteCoreConfig") private readonly config: UteCoreConfigs,
        private readonly cookieService: CookieService,
        private readonly httpService: HttpService,
        private readonly langService: LangService,
        private readonly pageService: PageService,
        private readonly seoService: SEOService,
        private readonly breakpoints: BreakpointObserver,
        private readonly analyticsService: AnalyticsService,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        @Inject(DOCUMENT) private readonly document: Document
    ) {
        if (!this.config.standalone) {
            this.localInit();
        }
    }

    /**
     * Calls the Init method only in standalone mode.
     *
     * @internal
     */
    private localInit() {
        this.Init();
    }

    /**
     * Cleans up all subscriptions when the component is destroyed.
     */
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    /**
     * Initializes the application.
     *
     * This method sets up the environment variables and then calls the Init methods of the
     * other services. It also sets up the event listeners for the router events.
     *
     * @returns A promise that resolves when the application is initialized.
     * @throws An error if the application fails to initialize.
     */
    public Init() {
        return new Promise((resolve) => {
            (async () => {
                try {
                    if (!this.config.environment.production) {
                        console.log(`${new Date().toISOString()} => CoreService`);
                    }

                    this.fragmentGenerator();

                    if (this.config) {
                        if (this.config.environment) {
                            let platform: string = Capacitor.getPlatform();

                            if (platform === "web") {
                                platform = this.isWebBrowser(platform);
                            }

                            if (this.config.environment.gtag) {
                                this.analyticsService.Init(this.config.environment.gtag);
                            }

                            this.config.environment.platform = platform;
                            this.subscriptions.add(this.isMobile().subscribe((status: boolean) => (this.config.environment.mobile = status)));
                            this.detectOS();
                        }
                    }

                    this.cookieService.Init(this.config.environment, this.config.cookiesExp);
                    this.httpService.Init(this.config.environment);
                    await this.langService.Init(this.config.environment, this.config);
                    if (this.config.pages?.length) {
                        this.pageService.Init(this.config.environment, this.config.pages);
                        this.seoService.Init(this.config.environment, this.langService, this.pageService);
                    }
                    this.loadSession();
                    resolve(true);
                } catch (error) {
                    throw Error(`App Load Error: ${error}`);
                }
            })();
        });
    }

    /**
     * When the user navigates to a URL with a fragment, the fragment is lost.
     * This function listens to NavigationStart and NavigationEnd events and
     * if the URL has changed, it checks if the fragment is present. If it is not,
     * it navigates to the same URL with the fragment.
     */
    private fragmentGenerator() {
        let location = "";

        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                if (event.url === this.document.location.pathname) {
                    location = this.document.location.href;
                } else {
                    location = "";
                }
            }

            if (event instanceof NavigationEnd) {
                if (location) {
                    this.activatedRoute.fragment.subscribe((fragment) => {
                        const hash: string = location?.split("#")[1];
                        location = "";

                        if (hash && !fragment) {
                            this.router.navigate([], {
                                relativeTo: this.activatedRoute,
                                fragment: hash,
                            });
                        }
                    });
                }
            }
        });
    }

    /**
     * Create full path to image or thumbnail
     * @param file - File data object
     * @param options - Options for image generation
     * @param options.all - Generate both image and thumbnail
     * @param options.thumb - Generate thumbnail
     * @param options.image - Generate image
     */
    public getMedia(file: any, options: { all: boolean; thumb: boolean; orig: boolean } = { all: true, thumb: false, orig: false }) {
        let server: string = this.config.environment.appServer ?? "";
        if (!server.endsWith("/")) server += "/";
        if (options.all || options.orig) {
            file.orig = `${server}api/media/${file.name}.${file.ex}`;
        }
        if (options.all || options.thumb) {
            if (file.type === "video") {
                file.thumb = `${server}api/media/${file.thumbnail}.png`;
            } else {
                file.thumb = file.thumbnail ? `${server}api/media/${file.thumbnail}.${file.ex}` : file.orig;
            }
        }
    }

    /**
     * Loads session data from cookies or initializes it if it's not exist.
     * @returns void
     */
    private loadSession() {
        if (!this.config.environment.session?.locale) {
            const session = this.cookieService.get("SS");
            if (session) {
                this.config.environment.session = session;
            } else {
                this.config.environment.session = {
                    locale: this.config.environment.defLocale,
                };
                this.cookieService.set("SS", this.config.environment.session);
            }
        }
    }

    /**
     * Check if app is web platform or browser instance
     * @returns status
     */
    private isWebBrowser(platform: string): string {
        if (typeof navigator === "object" && typeof navigator.userAgent === "string") {
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
        const clone = (obj: any) => JSON.parse(JSON.stringify(obj));

        /**
         * Updates the `sourceObj` with values from `updateObj`.
         *
         * The function iterates over each key in the `updateObj`. If the `sourceObj`
         * has the same key or if the `resize` option is enabled, it updates the value.
         * For nested objects, the function recursively updates the object values.
         *
         * If the `noEmpty` option is set, it only updates values from `updateObj` that
         * are not `null` or `undefined`.
         *
         * @param sourceObj - The object to be updated.
         * @param updateObj - The object containing the new values.
         * @returns The updated `sourceObj`.
         */
        const updateObject = (sourceObj: any, updateObj: UteObjects): any => {
            for (const key in updateObj) {
                if (sourceObj?.hasOwnProperty(key) || options?.resize) {
                    const sourceValue = sourceObj[key];
                    const updateValue = updateObj[key];

                    if (sourceValue && typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
                        sourceObj[key] = updateObject(sourceValue, updateValue);
                    } else if (options?.noEmpty) {
                        if (updateValue !== null && updateValue !== undefined) {
                            sourceObj[key] = updateValue;
                        }
                    } else {
                        sourceObj[key] = updateValue;
                    }
                }
            }
            return sourceObj;
        };

        try {
            let resource: any = clone(source);

            if (Array.isArray(resource)) {
                if (!options?.key) {
                    throw new Error("Missing 'key' option for array resources.");
                }

                const findKey = options.key;
                const findValue = target[findKey];
                let index = resource.findIndex((item: any) => item?.[findKey] === findValue);

                if (index !== -1) {
                    resource[index] = updateObject(resource[index], target);
                } else {
                    resource.push(target);
                    index = resource.length - 1;
                }

                if (options?.cut) {
                    resource[index] = this.toInterface(resource[index], options.cut);
                }
            } else {
                resource = updateObject(resource, target);

                if (options?.cut) {
                    resource = this.toInterface(resource, options.cut);
                }
            }

            return resource;
        } catch (error) {
            console.error("Error in toObject:", error);
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

        removeKeys.forEach((k: string) => {
            delete resource[k];
        });

        return resource;
    }

    /**
     * Processes the given file(s) and returns a promise with processed file data.
     *
     * The function handles various file types such as images, documents, and videos.
     * For images, it applies compression based on provided options. Supports processing
     * multiple files if the `multiple` option is enabled.
     *
     * @param file - The file or files to process.
     * @param options - Optional parameters for file processing.
     * @param options.quality - The compression quality for images, default is 0.65.
     * @param options.maxHeight - The maximum height for image compression, default is 1024.
     * @param options.maxWidth - The maximum width for image compression, default is 1024.
     * @param options.checkOrientation - Whether to check and adjust image orientation, default is true.
     * @param options.multiple - Whether to process multiple files, default is false.
     * @param options.uniqName - Whether to generate a unique name for the file, default is false.
     * @returns A promise that resolves with the processed file data, either a single file or an array of files.
     */
    public getFile(file: any, options?: UteFileOptions): Promise<any> {
        options ??= {} as UteFileOptions;

        if (!options?.full) {
            options.quality ??= 0.65;
            options.maxHeight ??= 1024;
            options.maxWidth ??= 1024;
            options.checkOrientation ??= true;
        }
        options.multiple ??= false;
        options.uniqName ??= false;

        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    let files: any[] = [];
                    let fileArray: any[] = Array.from(file.files);

                    const fileReadingPromises = fileArray.map((fileData: any) => {
                        return this.readFile(fileData, options);
                    });

                    await Promise.all(fileReadingPromises);

                    if (options?.multiple) {
                        resolve(files);
                    } else {
                        resolve(files[0]);
                    }
                } catch (error) {
                    reject(error as Error);
                }
            })();
        });
    }

    private readFile(fileData: any, options?: UteFileOptions): Promise<any> {
        return new Promise((resolve, reject) => {
            let array: string[] = fileData.name.split(".");
            const ex: string = array[array.length - 1];
            array.splice(-1, 1);
            let name: string = array.join(".");
            let uid: string = v4();
            if (options?.uniqName) name = `${name}-${uid}`;
            const mimetype: string = fileData.type;

            let type: string = "file";
            if (UteFileFormats.images.some((format: string) => format === ex)) {
                type = "image";
            } else if (UteFileFormats.docs.some((format: string) => format === ex)) {
                type = "doc";
            } else if (UteFileFormats.videos.some((format: string) => format === ex)) {
                type = "video";
            }
            if (type === "image" && !UteFileFormats.imageIgnor.some((img: string) => ex === img)) {
                const fileReaderFunc = this.fileReaderFunc.bind(this);
                const res = new Compressor(fileData, {
                    quality: options?.quality,
                    maxHeight: options?.maxHeight,
                    maxWidth: options?.maxWidth,
                    checkOrientation: options?.checkOrientation,
                    success(result) {
                        const res = fileReaderFunc(uid, type, name, ex, mimetype, result);
                        return res;
                    },
                    error(error) {
                        reject(error);
                    },
                });
                resolve(res);
            } else {
                const res = this.fileReaderFunc(uid, type, name, ex, mimetype, fileData);
                resolve(res);
            }
        });
    }

    /**
     * Reads file data and returns a promise with file information.
     *
     * This function utilizes a FileReader to read the provided file data and
     * converts it into a Blob object. The resulting file information is then
     * resolved as an array containing an object with the file's unique identifier,
     * type, name, extension, and data.
     *
     * @param uid - Unique identifier for the file.
     * @param type - Type of the file (e.g., image, doc, video).
     * @param name - Name of the file without extension.
     * @param ex - File extension.
     * @param mimetype - MIME type of the file.
     * @param fileData - The actual file data to be processed.
     * @returns A promise that resolves with an array containing the processed file information.
     */
    private fileReaderFunc(uid: string, type: string, name: string, ex: string, mimetype: string, fileData: any): Promise<any> {
        const files: any[] = [];
        return new Promise((resolve) => {
            let fileReader: FileReader = new FileReader();
            fileReader.onload = () => {
                const fileData: any = fileReader.result;
                const byteCharacters = atob(fileData.split(",")[1]);
                const byteNumbers = new Uint8Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }

                files.push({
                    uid: uid,
                    type: type,
                    name: name,
                    ex: ex,
                    data: new Blob([byteNumbers], { type: mimetype }),
                });
                resolve(files);
            };
            fileReader.readAsDataURL(fileData);
        });
    }

    /**
     * Gets the week of the month for a given date.
     *
     * If `returnDay` is set to `true`, the function will return the day of the week (1-7) instead of the week of the month.
     *
     * The week of the month is calculated as the week that contains the date and is zero-indexed.
     * @param eventDate - The date for which to get the week of the month.
     * @param returnDay - Whether to return the day of the week instead of the week of the month.
     * @returns The week of the month or the day of the week.
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
     * Converts a date to the ISO 8601 format with timezone offset.
     * @param date - The date to convert.
     * @returns The ISO 8601 formatted date string.
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
     * Return if mobile device
     * @param custom - Custom width size
     */
    public isMobile(custom?: string): Observable<boolean> {
        return this.breakpoints.observe(`(max-width: ${custom ?? 860}px)`).pipe(map((breakpoint) => breakpoint.matches));
    }

    /**
     * Formats a date string according to a specified type.
     *
     * This function processes the input format string and transforms it
     * based on the specified type, which can be "date", "time", "shortdate",
     * or "shorttime". The transformation adjusts the year and month formats
     * according to the specified type.
     *
     * @param format - The date format string to transform.
     * @param type - The type of formatting to apply ("date", "time", "shortdate", "shorttime").
     * @returns The formatted date string.
     */
    public dateFormat(format: string, type: "date" | "time" | "shortdate" | "shorttime"): string {
        const dateRegex = /(?:[dmy]+\W?){3}/gi;
        const value = JSON.parse(JSON.stringify(format));
        const match = value.match(dateRegex);

        if (!value) return format;

        const getYearFormat = (isLong: boolean) => (isLong ? "YYYY" : "yyyy");
        const getShortYearFormat = (isLong: boolean) => (isLong ? "YY" : "yy");

        switch (type) {
            case "date":
                if (match) {
                    const yearFormat = getYearFormat(match[0].includes("Y"));
                    return match[0].replace(/y{2,4}/gi, yearFormat);
                }
                return value;

            case "time":
                return value.replace(/y{2,4}/gi, getYearFormat(value.includes("Y")));

            case "shorttime":
                return value.replace(/m{2,5}/gi, value.includes("M") ? "MM" : "mm").replace(/y{2,4}/gi, getShortYearFormat(value.includes("Y")));

            case "shortdate":
                if (match) {
                    const yearFormat = getShortYearFormat(match[0].includes("Y"));
                    return match[0].replace(/y{2,4}/gi, yearFormat);
                }
                return value;

            default:
                return format;
        }
    }

    /**
     * Check router is load
     * @param outlet
     * @returns boolean status
     */
    public prepareRoute(outlet: any) {
        return outlet?.activatedRouteData["animationState"] ?? false;
    }

    /**
     * Return machine OS
     * @param value - OS string
     */
    public detectOS() {
        if (typeof navigator === "object" && typeof navigator.userAgent === "string") {
            if (/android/i.test(navigator.userAgent)) {
                this.config.environment.os = "android";
            } else if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                this.config.environment.os = "ios";
            } else if (/X11|Linux/.test(navigator.userAgent)) {
                this.config.environment.os = "linux";
            } else if (/Macintosh|MacIntel|MacPPC|Mac68K|Mac/.test(navigator.userAgent)) {
                this.config.environment.os = "macos";
            } else if (/Win32|Win64|Windows|WinCE/.test(navigator.userAgent)) {
                this.config.environment.os = "windows";
            }
        }
    }

    /**
     * Generate random string with nessesary upper & lower case, number & pecial symbol
     * @returns generated string
     */
    public generateString(options?: StringOptions): string {
        if (options?.uuid) {
            return v4();
        } else {
            const numberChars: string = "0123456789";
            const upperChars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const lowerChars: string = "abcdefghijklmnopqrstuvwxyz";
            const symbolChars: string = "!@#$%^&*";
            let allChars: string = "";
            let randCodeArray: string[] = Array(options?.lengthChars ?? 10);
            let index: number = 0;

            if ((options && !options.numberDisable) || !options) {
                allChars += numberChars;
                randCodeArray[index] = numberChars;
                index++;
            }
            if ((options && !options.upperDisable) || !options) {
                allChars += upperChars;
                randCodeArray[index] = upperChars;
                index++;
            }
            if ((options && !options.lowerDisable) || !options) {
                allChars += lowerChars;
                randCodeArray[index] = lowerChars;
                index++;
            }
            if ((options && !options.symbolDisable) || !options) {
                allChars += symbolChars;
                randCodeArray[index] = symbolChars;
                index++;
            }

            randCodeArray = randCodeArray.fill(allChars, index);

            let genArray: string[] = randCodeArray.map((x: any) => x[Math.floor(Math.random() * x.length)]);
            genArray.forEach((x: string, ix: number) => {
                let j = Math.floor(Math.random() * (ix + 1));
                x = genArray[j];
                genArray[j] = x;
            });

            return genArray.join("");
        }
    }

    /**
     * Convert a number to its Roman numeral representation.
     *
     * @param num - The number to convert to Roman numerals.
     *
     * @returns The Roman numeral representation of the input number.
     */
    public romanNumbers(num: number): string {
        const digits: number[] = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        const letters: string[] = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
        let result: string = "";
        for (let i: number = 0; i < digits.length; i++) {
            while (num >= digits[i]) {
                result += letters[i];
                num -= digits[i];
            }
        }
        return result;
    }

    /**
     * Returns a random number between the given min and max values.
     * Uses the browser's built-in crypto.getRandomValues() to generate a random number.
     * If the generated number is outside of the range, it will recursively call itself until a number within the range is generated.
     *
     * @param min - The minimum number to generate.
     * @param max - The maximum number to generate.
     *
     * @returns A random number between min and max.
     */
    public random(min: number = 0, max: number = 1): number {
        const byteArray = new Uint8Array(1);
        window.crypto.getRandomValues(byteArray);

        const range = max - min + 1;
        const max_range = 256;
        if (byteArray[0] >= Math.floor(max_range / range) * range) return this.random(min, max);
        return min + (byteArray[0] % range);
    }
}
