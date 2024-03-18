import { Inject, Injectable } from "@angular/core";
import { UteEnvironment } from "../interfaces/environment";
import { LocaleData } from "../interfaces/locale";
import { HttpService } from "./http.service";
import { DOCUMENT, registerLocaleData, Location } from "@angular/common";
import { UteCoreConfigs } from "../interfaces/config";
import { Router, Routes, NavigationStart, NavigationEnd } from "@angular/router";

@Injectable({
    providedIn: "root",
})
export class LangService {
    private environment: UteEnvironment = {} as UteEnvironment;
    private config: UteCoreConfigs = {} as UteCoreConfigs;
    private localeData: LocaleData[] = [];
    private locale: string = "";
    private tag: string = "";
    private defaultRoute: Routes = [];
    private isNav: boolean = false;
    private isUpdate: boolean = false;

    constructor(@Inject(DOCUMENT) private document: Document, private httpService: HttpService, private location: Location, private router: Router) {
        this.defaultRoute = this.router.config;
        this.router.events.subscribe((data) => {
            if (data instanceof NavigationStart) {
                if (!this.isNav) {
                    this.isNav = true;
                    this.router.navigateByUrl(this.updateUrl(data.url));
                }
            }
            if (data instanceof NavigationEnd) {
                if (this.isNav) {
                    this.isNav = false;
                }
            }
        });
    }

    /**
     * Initialization module
     */
    public async Init(environment: UteEnvironment, config: UteCoreConfigs) {
        console.log("LangService - Init");
        // console.log(`${new Date().toISOString()} => LangService`);

        this.environment = environment;
        this.config = config || ({} as UteCoreConfigs);
        await this.loadLibraries();
    }

    /**
     * Get translate text by code
     * @param code - Text identifier code
     * @returns Translate string
     */
    public get(code: string): string {
        return this.localeData.find((locale: LocaleData) => locale.code === code)?.text || code;
    }

    /**
     * Get current Locale code
     * @returns Locale code
     */
    public current(): string {
        return this.locale;
    }

    /**
     * Set new Locale code
     * @param locale - Locale code from system
     * @param rewrite - Ignore link tag and use `locale`
     * @returns
     */
    public setLocale(locale: string, rewrite: boolean = false): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                this.getTag(locale, rewrite);
                await this.loadLocale();
                resolve(this.locale);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Load Angular Locale libraries for another modules
     * @returns Complete status
     */
    private loadLibraries(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.environment.localeList) {
                    this.environment.localeList = ["en-EN"];
                }
                this.environment.localeList.map(async (x: string) => {
                    let locale = await import(`/node_modules/@angular/common/locales/${this.localeToTag(x)}.mjs`);
                    registerLocaleData(locale.default);
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Load texts from locale json document
     * @returns Complete status
     */
    private async loadLocale(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                this.localeData = await this.httpService.httpLocal<LocaleData[]>(`${this.config.path ? this.config.path : "assets/locales/"}${this.locale}.json?v=${Date.now()}`);

                this.document.documentElement.lang = this.locale;

                this.updateRouter();
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Update Angular Router list for Locale usage
     */
    private updateRouter() {
        if (!this.isUpdate) {
            this.isUpdate = true;
        }

        if (this.tag === "") {
            this.router.config = this.defaultRoute;
        } else {
            this.router.config = [
                {
                    path: "",
                    redirectTo: this.localeToTag(this.tag),
                    pathMatch: "full",
                },
                {
                    path: this.localeToTag(this.tag),
                    children: this.defaultRoute,
                },
                {
                    path: "**",
                    redirectTo: ``,
                },
            ];
        }

        let url: string = this.updateUrl(location.pathname);

        let interval = setInterval(() => {
            if (!this.isNav) {
                clearInterval(interval);
                this.location.go(url);
            }
        }, 50);
    }

    /**
     * Convert Locale code to Lang tag
     * @param locale - Locale code
     * @returns Lang tag
     */
    private localeToTag(locale?: string): string {
        if (locale) {
            return locale.split("-")[0];
        } else {
            return this.locale.split("-")[0];
        }
    }

    /**
     * Check & get priority Lang tag
     * @param locale - Locale code from system
     * @param rewrite - Ignore link tag and use `locale`
     */
    private getTag(locale: string, rewrite: boolean = false) {
        let urlTag = this.urlToTag();

        if (this.config.alwaysLocale) {
            if (rewrite) {
                this.tag = this.locale = locale;
            } else {
                this.tag = this.locale = urlTag;
            }
        } else {
            if (rewrite) {
                if (locale === this.environment.defLocale) {
                    this.locale = locale;
                    this.tag = "";
                } else {
                    this.tag = this.locale = locale;
                }
            } else {
                if (urlTag === this.environment.defLocale) {
                    this.locale = urlTag;
                    this.tag = "";
                } else {
                    this.tag = this.locale = urlTag;
                }
            }
        }
    }

    /**
     * Convert Lang tag from url to Locale code
     * @returns Tag code
     */
    private urlToTag(): string {
        return (this.environment.localeList || ["en-EN"]).find((lang: string) => location.pathname.includes(this.localeToTag(lang))) || this.environment.defLocale || "en-EN";
    }

    /**
     * Add or remove Lang tag at url
     * @param value - `url` to change
     * @returns new `url`
     */
    private updateUrl(value: string): string {
        if (this.isUpdate) {
            (this.environment.localeList || ["en-EN"]).map((l: string) => {
                let lang: string = this.localeToTag(l);
                value = value.replace(`/${lang}`, "");
            });
            if (this.tag) {
                return `${this.localeToTag(this.tag)}${value.startsWith("/") ? value : "/" + value}`;
            } else {
                return value;
            }
        } else {
            return value;
        }
    }
}
