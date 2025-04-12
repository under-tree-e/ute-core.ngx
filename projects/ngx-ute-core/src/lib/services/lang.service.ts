import { Inject, Injectable } from "@angular/core";
import { Router, Routes, NavigationStart, NavigationEnd } from "@angular/router";
import { registerLocaleData, Location, DOCUMENT } from "@angular/common";

import { UteEnvironment } from "../interfaces/environment";
import { HttpService } from "./http.service";
import { UteCoreConfigs } from "../interfaces/config";

@Injectable({
    providedIn: "root",
})
export class LangService {
    private environment: UteEnvironment = {} as UteEnvironment;
    private config: UteCoreConfigs = {} as UteCoreConfigs;
    private localeData: any = {};
    private locale: string = "";
    private tag: string = "";
    private readonly defaultRoute: Routes = [];
    private isNav: boolean = false;
    private isUpdate: boolean = false;

    /**
     * The constructor for the LangService class.
     *
     * @param document - The DOCUMENT injection token.
     * @param httpService - The HttpService injection token.
     * @param location - The Location injection token.
     * @param router - The Router injection token.
     *
     * This constructor is used to initialize the LangService class and set up the router event subscription.
     * The event subscription is used to update the URL when the language is changed.
     */
    constructor(@Inject(DOCUMENT) private readonly document: Document, private readonly httpService: HttpService, private readonly location: Location, private readonly router: Router) {
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
     * Initialize the LangService.
     *
     * @param environment - The environment settings.
     * @param config - The Ute Core Configs Params.
     *
     * Initialize the LangService with the environment settings and the Ute Core Configs Params.
     * If the environment setting production is false, the LangService will log a message to the console.
     * The LangService will also set the environment and config variables.
     * Then the LangService will load the locale libraries.
     */
    public async Init(environment: UteEnvironment, config: UteCoreConfigs) {
        if (!environment.production) {
            console.log(`${new Date().toISOString()} => LangService`);
        }

        this.environment = environment;
        this.config = config || ({} as UteCoreConfigs);
        await this.loadLibraries();
    }

    /**
     * Get localized text
     * @param code - uid code to search
     * @returns translated text
     */
    public get(code: string): string {
        return this.localeData[code] || code;
    }

    /**
     * Returns the default locale.
     *
     * @returns The default locale.
     */
    public default(): string {
        return this.environment.defLocale || "en-EN";
    }

    /**
     * Get list of available locales
     * @returns List of locales
     */
    public localList(): string[] {
        return this.environment.localeList || ["en-EN"];
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
    public setLocale(locale: string): Promise<string> {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    this.getTag(locale, true);
                    await this.loadLocale();
                    resolve(this.locale);
                } catch (error) {
                    reject(error as Error);
                }
            })();
        });
    }

    /**
     * Load Angular Locale libraries for another modules
     * @returns Complete status
     */
    private loadLibraries(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    // Check base data
                    if (!this.environment.localeList) {
                        this.environment.localeList = ["en-EN"];
                    }
                    if (!this.environment.defLocale) {
                        this.environment.defLocale = "en-EN";
                    }
                    if (!this.locale) {
                        this.locale = this.environment.defLocale;
                    }
                    this.getTag(this.locale);

                    // Load library
                    if (this.environment.ssr === true) {
                        this.environment.localeList.forEach(async (x: string) => {
                            let locale = await import(/* @vite-ignore */ `/node_modules/@angular/common/locales/${this.localeToTag(x)}.mjs`);
                            registerLocaleData(locale.default);
                        });
                    } else {
                        this.environment.localeList.forEach(async (x: string) => {
                            let locale = await import(`../../@angular/common/locales/${this.localeToTag(x)}.mjs`);
                            registerLocaleData(locale.default);
                        });
                    }

                    await this.loadLocale();

                    resolve(true);
                } catch (error) {
                    reject(error as Error);
                }
            })();
        });
    }

    /**
     * Load texts from locale json document
     * @returns Complete status
     */
    private async loadLocale(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    this.localeData = await this.httpService.httpLocal<any>(`${this.config.path ? this.config.path : "assets/locales/"}${this.locale}.json?v=${Date.now()}`);

                    this.document.documentElement.lang = this.locale;

                    this.updateRouter();
                    resolve(true);
                } catch (error) {
                    reject(error as Error);
                }
            })();
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
                    redirectTo: `${this.localeToTag(this.tag)}/**`,
                },
            ];
        }

        let url: string = this.updateUrl(this.location.path());
        this.router.navigateByUrl(url);
    }

    /**
     * Convert Locale code to Lang tag
     * @param locale - Locale code
     * @returns Lang tag
     */
    public localeToTag(locale?: string): string {
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
        } else if (rewrite) {
            if (locale === this.environment.defLocale) {
                this.locale = locale;
                this.tag = "";
            } else {
                this.tag = this.locale = locale;
            }
        } else if (urlTag === this.environment.defLocale) {
            this.locale = urlTag;
            this.tag = "";
        } else {
            this.tag = this.locale = urlTag;
        }
    }

    /**
     * Convert Lang tag from url to Locale code
     * @returns Tag code
     */
    public urlToTag(): string {
        return ((this.environment.localeList || ["en-EN"]).find((lang: string) => this.location.path().includes(this.localeToTag(lang))) ?? this.environment.defLocale) || "en-EN";
    }

    /**
     * Add or remove Lang tag at url
     * @param value - `url` to change
     * @returns new `url`
     */
    private updateUrl(value: string): string {
        if (this.isUpdate) {
            (this.environment.localeList || ["en-EN"]).forEach((l: string) => {
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
