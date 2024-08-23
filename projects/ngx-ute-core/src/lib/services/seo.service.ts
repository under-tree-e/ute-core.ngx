import { Injectable } from "@angular/core";
import { Title, Meta } from "@angular/platform-browser";
import { LangService } from "./lang.service";

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

    constructor(private bodyTitle: Title, private metaService: Meta, private langService: LangService) {
        // this._originalTitle = this.langService.get("seoTitle");
        // this._originalDesk = this.langService.get("seoDesk");
        // this._originalKeywords = this.langService.get("seoKeywords");
        // console.log(this.langService);
    }

    public Init(langService?: LangService) {
        console.log("INIT");

        this._originalTitle = this.langService.get("seoTitle");
        this._originalDesk = this.langService.get("seoDesk");
        this._originalKeywords = this.langService.get("seoKeywords");

        console.log(this._originalTitle);
    }

    get title(): string {
        return this._title;
    }

    set title(title: string) {
        console.log("title", title);

        this._title = title;
        if (title === "") {
            title = this._originalTitle;
        } else {
            title = `${this._pipe ? this.langService.get(title) : title} | ${this._originalTitle}`;
        }
        this.bodyTitle.setTitle(title);
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
        this.metaService.updateTag({ name: "description", content: desk });
        this.metaService.updateTag({ name: "twitter:description", content: desk });
        this.metaService.updateTag({ name: "og:description", content: desk });
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
        this.metaService.updateTag({ name: "keywords", content: keys });
    }

    set pipe(pipe: boolean) {
        this._pipe = pipe;
    }
}
