import { Injectable } from "@angular/core";
import { Title, Meta } from "@angular/platform-browser";
import { LangService } from "./lang.service";
import { NavigationStart, Router } from "@angular/router";
import { PageService } from "./page.service";
import { UteEnvironment } from "../interfaces/environment";
import { DataLangPipe } from "../pipes/datalang.pipe";

/**
 * Service responsible for setting the title that appears above the components and guide pages.
 */
@Injectable({
    providedIn: "root",
})
export class SEOService {
    private _title: string = "";
    private _desk: string = "";
    private _keywords: string = "";
    private _pipe: boolean = false;
    private _originalTitle: string = "";
    private _originalDesk: string = "";
    private _originalKeywords: string = "";

    private pageService: PageService = null!;
    private langService: LangService = null!;
    private url: string = "";

    constructor(private router: Router, private bodyTitle: Title, private metaService: Meta, private dataLang: DataLangPipe) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationStart) {
                if (this.pageService && this.langService) {
                    this.seoGenerate();
                } else {
                    this.url = event.url;
                }
            }
        });
    }

    public Init(environment: UteEnvironment, langService: LangService, pageService: PageService) {
        if (!environment.production) {
            console.log(`${new Date().toISOString()} => SEOService`);
        }
        this.langService = langService;
        this.pageService = pageService;

        this._originalTitle = this.langService.get("seoTitle");
        this._originalDesk = this.langService.get("seoDesk");
        this._originalKeywords = this.langService.get("seoKeywords");

        this.seoGenerate();
    }

    private seoGenerate() {
        const pageItem = this.pageService.getItemById(this.url);
        if (pageItem) {
            this.pipe = pageItem.pipe || false;
            this.title = pageItem.name;
            this.desk = pageItem.desc;
            this.keys = pageItem.keys || "";
        }
    }

    get title(): string {
        return this._title;
    }

    set title(title: string) {
        this._title = title;
        if (title === "") {
            title = this._originalTitle;
        } else {
            title = `${this._pipe ? this.langService.get(title) : title} | ${this._originalTitle}`;
        }
        title = this.dataLang.transform(title);
        this.bodyTitle.setTitle(title);
        this.metaService.updateTag({ name: "twitter:title", content: title });
        this.metaService.updateTag({ property: "og:title", content: title });
    }

    get desk(): string {
        return this._desk;
    }

    set desk(desk: string) {
        this._desk = desk;
        if (desk === "") {
            desk = this._originalDesk;
        } else {
            desk = `${this._pipe ? this.langService.get(desk) : desk}`;
        }
        desk = this.dataLang.transform(desk);
        this.metaService.updateTag({ name: "description", content: desk });
        this.metaService.updateTag({ name: "twitter:description", content: desk });
        this.metaService.updateTag({ property: "og:description", content: desk });
    }

    get keys(): string {
        return this._keywords;
    }

    set keys(keys: string) {
        this._keywords = keys;
        if (keys === "") {
            keys = this._originalKeywords;
        } else {
            keys = `${this._pipe ? this.langService.get(keys) : keys}`;
        }
        keys = this.dataLang.transform(keys);
        this.metaService.updateTag({ name: "keywords", content: keys });
    }

    set pipe(pipe: boolean) {
        this._pipe = pipe;
    }
}
