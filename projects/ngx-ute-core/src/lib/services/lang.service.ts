import { Inject, Injectable } from "@angular/core";
import { UteEnvironment } from "../interfaces/environment";
import { LocaleData } from "../interfaces/locale";
import { HttpService } from "./http.service";
import { DOCUMENT, registerLocaleData, Location } from "@angular/common";
import { UteCoreConfigs } from "../interfaces/config";
import { Router, Routes, Route, ActivationStart, ActivatedRoute, NavigationStart, NavigationEnd } from "@angular/router";

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

    constructor(@Inject(DOCUMENT) private document: Document, private httpService: HttpService, private location: Location, private router: Router, private route: ActivatedRoute) {
        this.defaultRoute = this.router.config;
        this.router.events.subscribe((data) => {
            if (data instanceof NavigationStart) {
                if (!this.isNav) {
                    this.isNav = true;
                    this.router.navigateByUrl(this.updateRoute(data.url));
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
        this.locale = this.environment.defLocale || "en-EN";
        await this.loadLibraries();
    }

    public get(code: string): string {
        return this.localeData.find((locale: LocaleData) => locale.code === code)?.text || code;
    }

    public current(): string {
        return this.locale;
    }

    public setLocale(locale: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            this.locale = locale;
            await this.loadLocale(true);
            resolve(true);
        });
    }

    private localeTag(locale?: string): string {
        if (locale) {
            return locale.split("-")[0];
        } else {
            return this.locale.split("-")[0];
        }
    }

    private loadLibraries(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                if (!this.environment.localeList) {
                    this.environment.localeList = ["en-EN"];
                }
                this.environment.localeList.map(async (x: string) => {
                    let locale = await import(`/node_modules/@angular/common/locales/${this.localeTag(x)}.mjs`);
                    registerLocaleData(locale.default);
                });
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    private async loadLocale(update: boolean = false): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            this.localeData = await this.httpService.httpLocal<LocaleData[]>(`${this.config.path ? this.config.path : "assets/locales/"}${this.locale}.json?v=${Date.now()}`);

            this.document.documentElement.lang = this.locale;

            if (update) {
                this.updateUrl();
            }
            resolve(true);
        });
    }

    private updateUrl() {
        if (!this.isUpdate) {
            this.isUpdate = true;
        }

        this.tag = this.environment.localeList.find((lang: string) => location.pathname.includes(this.localeTag(lang))) || "";

        if (
            (this.config.alwaysLocale && (this.tag === "" || this.tag != this.locale)) ||
            (!this.config.alwaysLocale && ((this.tag !== "" && this.tag != this.locale) || (this.tag === "" && this.locale != this.environment.defLocale)))
        ) {
            this.tag = this.locale;
        } else if (!this.config.alwaysLocale && this.tag == this.locale) {
            this.tag = "";
        }

        console.log("tag", this.tag);
        console.log("locale", this.locale);

        if (this.tag === "") {
            this.router.config = this.defaultRoute;
        } else {
            this.router.config = [
                {
                    path: "",
                    redirectTo: this.localeTag(this.tag),
                    pathMatch: "full",
                },
                {
                    path: this.localeTag(this.tag),
                    children: this.defaultRoute,
                },
                {
                    path: "**",
                    redirectTo: ``,
                },
            ];
        }

        let url: string = this.updateRoute(location.pathname);
        console.log(url);
        console.log(this.router.config);

        let interval = setInterval(() => {
            if (!this.isNav) {
                clearInterval(interval);
                this.location.go(url);
            }
        }, 50);
    }

    private updateRoute(value: string): string {
        if (this.isUpdate) {
            if (this.tag) {
                return "";
            } else {
                //--
                let languages: string[] = this.environment.localeList.map((l: string) => this.localeTag(l));

                let languagePrefix = `${languages.join("/")}/`;
                let remainingPath = value.slice(languagePrefix.length);
                return remainingPath;
            }
            // if (value.includes(`${this.localeTag(this.tag)}/`)) {
            //     let array: string[] = value.split("/");
            //     array.shift();
            //     return `/${array.join("/")}`;
            // } else {
            //     let sl: string = value.startsWith("/") ? "" : "/";
            //     return `${this.tag ? `${this.localeTag(this.tag)}${sl}` : ""}${value}`;
            // }
        } else {
            return value;
        }
    }
}
