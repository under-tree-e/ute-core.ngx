/* Module imports */
import { Directive, inject, Input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { PlatformLocation } from "@angular/common";

/* Project imports */
import { LangService } from "../services/lang.service";

@Directive({
    selector: "[routerLink]",
    standalone: true,
})
export class LangRouterPrefixDirective extends RouterLink {
    private readonly langService = inject(LangService);
    private readonly platformLocation = inject(PlatformLocation);
    private localRouterLink!: string | any[];

    @Input()
    /**
     * Overrides the `routerLink` input property to update the local router link value.
     *
     * This setter removes the leading slash from the input value if present, and
     * assigns the processed value to `localRouterLink`. This ensures that the
     * local router link is correctly formatted for locale prefixing.
     *
     * @param value - The input router link value which can be a string or an array.
     */
    override set routerLink(value: string | any[]) {
        this.localRouterLink = value[0] === "/" ? value.slice(1) : value;
    }

    /**
     * Update the locale prefix after the input property changes.
     *
     * We need to update the locale prefix when the input property changes.
     * This is because the locale prefix is based on the input property.
     */
    override ngOnChanges() {
        this.updateLocalePrefix();
    }

    /**
     * Updates the locale prefix for the element's router link attributes.
     *
     * This method constructs a locale-based prefix for the router link. If the
     * current language tag matches the default language, the prefix is omitted.
     * The function then updates the `href`, `ng-reflect-router-link`, and
     * `routerLink` attributes of the element with the computed prefix.
     */
    private updateLocalePrefix() {
        const tag: string = this.langService.urlToTag();
        const defaultLang: string = this.langService.default();
        const localVar: any = this;

        let prefix: string = `/${this.langService.localeToTag()}`;
        if (defaultLang === tag) {
            prefix = "";
        }
        let baseHref: string = this.platformLocation.getBaseHrefFromDOM() ?? "";
        baseHref = baseHref.endsWith("/") ? baseHref.slice(0, -1) : `${baseHref}/`;

        localVar.el.nativeElement.setAttribute("href", `${baseHref}${prefix}/${this.localRouterLink}`);
        localVar.el.nativeElement.setAttribute("ng-reflect-router-link", `${baseHref}${prefix}/${this.localRouterLink}`);
        localVar.el.nativeElement.setAttribute("routerLink", `${baseHref}${prefix}/${this.localRouterLink}`);
    }
}
