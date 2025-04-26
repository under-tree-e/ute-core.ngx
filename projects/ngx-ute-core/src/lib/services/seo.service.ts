/* Module imports */
import { Injectable } from "@angular/core";
import { Title, Meta } from "@angular/platform-browser";
import { NavigationStart, Router } from "@angular/router";

/* Project imports */
import { LangService } from "./lang.service";
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

    /**
     * Initializes the SEOService with dependencies and sets up router event subscription.
     *
     * @param router - The Router used for navigation events.
     * @param bodyTitle - The Title service for setting the document title.
     * @param metaService - The Meta service for updating meta tags.
     * @param dataLang - The DataLangPipe for transforming language-specific text.
     *
     * This constructor subscribes to router events to trigger SEO generation when navigation starts.
     * If the pageService and langService are available, it calls the seoGenerate method.
     * Otherwise, it stores the URL for later processing.
     */
    constructor(private readonly router: Router, private readonly bodyTitle: Title, private readonly metaService: Meta, private readonly dataLang: DataLangPipe) {
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

    /**
     * Initializes the SEOService.
     *
     * @param environment - The environment settings for the app.
     * @param langService - The LangService for retrieving language-specific text.
     * @param pageService - The PageService for retrieving page data.
     *
     * This method sets up the environment, LangService and PageService variables.
     * It also sets the original title, description and keywords to the language-specific text.
     * Finally, it calls the seoGenerate method to generate the SEO data.
     */
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

    /**
     * Generates SEO data based on the current URL.
     *
     * This method retrieves the page data for the current URL and sets the title, description and keywords
     * to the language-specific text from the page data. If the page data is not available, it sets the
     * original title, description and keywords as the language-specific text. Finally, it calls the
     * setTitle method to set the document title and update the meta tags.
     */
    private seoGenerate() {
        const pageItem = this.pageService.getItemById(this.url);
        if (pageItem) {
            this.pipe = pageItem.pipe || false;
            this.title = pageItem.name;
            this.desk = pageItem.desc;
            this.keys = pageItem.keys || "";
        }
    }

    /**
     * Retrieves the current title.
     *
     * @returns The current title.
     */
    get title(): string {
        return this._title;
    }

    /**
     * Sets the title of the page.
     *
     * If the title is empty, it sets the original title as the language-specific text.
     * Otherwise, it sets the title to the language-specific text transformed by the DataLangPipe.
     * Then, it sets the document title and updates the meta tags.
     * @param title - The title to set.
     */
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

    /**
     * Retrieves the current description.
     *
     * @returns The current description.
     */
    get desk(): string {
        return this._desk;
    }

    /**
     * Sets the description of the page.
     *
     * If the description is empty, it sets the original description as the language-specific text.
     * Otherwise, it sets the description to the language-specific text transformed by the DataLangPipe.
     * Then, it sets the meta description and updates the meta tags.
     * @param desk - The description to set.
     */
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

    /**
     * Retrieves the current keywords.
     *
     * @returns The current keywords.
     */
    get keys(): string {
        return this._keywords;
    }

    /**
     * Sets the keywords of the page.
     *
     * If the keywords are empty, it sets the original keywords as the language-specific text.
     * Otherwise, it sets the keywords to the language-specific text transformed by the DataLangPipe.
     * Then, it sets the meta keywords and updates the meta tags.
     * @param keys - The keywords to set.
     */
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

    /**
     * Determines whether the `desk` and `keys` properties should apply the language-specific text
     * using the DataLangPipe.
     *
     * @param pipe - `true` to apply the language-specific text, `false` otherwise.
     */
    set pipe(pipe: boolean) {
        this._pipe = pipe;
    }
}
