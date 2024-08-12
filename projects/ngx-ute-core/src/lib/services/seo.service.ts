import { inject, Inject, Injectable, Optional, Self, SkipSelf } from "@angular/core";
import { Title, Meta } from "@angular/platform-browser";
import { LangService } from "./lang.service";
import { HttpClient } from "@angular/common/http";

/**
 * Service responsible for setting the title that appears above the components and guide pages.
 */
@Injectable({
    providedIn: "root",
})
// @Injectable()
export class SEOService {
    // private langService: LangService = {} as LangService;
    // private bodyTitle: Title = {} as Title;
    // private metaService: Meta = {} as Meta;

    // private readonly bodyTitle = inject(Title, { self: true });
    // private readonly bodyTitle = inject(Title);
    // private readonly http = inject(HttpClient);

    private _title: string = "";
    private _desk: string = "";
    private _keywords: string = "";
    private _pipe: boolean = false;
    private _originalTitle: string = "";
    private _originalDesk: string = "";
    private _originalKeywords: string = "";

    constructor(private bodyTitle: Title, private metaService: Meta, private langService: LangService) {
        // constructor() {
        // constructor(private http: HttpClient) {
        // constructor(private bodyTitle: Title) {
        console.log(105);

        // this._originalTitle = this.langService.get("seoTitle");
        // this._originalDesk = this.langService.get("seoDesk");
        // this._originalKeywords = this.langService.get("seoKeywords");
    }

    // public Init() {
    //     console.log(105.1);

    //     // public Init(bodyTitle: Title, metaService: Meta, langService: LangService) {
    //     // this.langService = langService;
    //     // this.bodyTitle = bodyTitle;
    //     // this.metaService = metaService;
    //     // this._originalTitle = this.langService.get("seoTitle");
    //     // this._originalDesk = this.langService.get("seoDesk");
    //     // this._originalKeywords = this.langService.get("seoKeywords");
    // }

    // get title(): string {
    //     return this._title;
    // }

    // set title(title: string) {
    //     this._title = title;
    //     if (title === "") {
    //         title = this._originalTitle;
    //     } else {
    //         title = `${this._pipe ? this.langService.get(title) : title} | ${this._originalTitle}`;
    //     }
    //     this.bodyTitle.setTitle(title);
    // }

    // get desk(): string {
    //     return this._desk;
    // }

    // set desk(desk: string) {
    //     this._desk = desk;
    //     if (desk === "") {
    //         desk = this._originalDesk;
    //     } else {
    //         desk = `${this._pipe ? this.langService.get(desk) : desk} | ${this._originalDesk}`;
    //     }
    //     this.metaService.updateTag({ name: "description", content: desk });
    //     this.metaService.updateTag({ name: "twitter:description", content: desk });
    //     this.metaService.updateTag({ name: "og:description", content: desk });
    // }

    // get keys(): string {
    //     return this._keywords;
    // }

    // set keys(keys: string) {
    //     this._keywords = keys;
    //     if (keys === "") {
    //         keys = this._originalKeywords;
    //     } else {
    //         keys = `${this._pipe ? this.langService.get(keys) : keys} | ${this._originalDesk}`;
    //     }
    //     this.metaService.updateTag({ name: "keywords", content: keys });
    // }

    // set pipe(pipe: boolean) {
    //     this._pipe = pipe;
    // }
}
