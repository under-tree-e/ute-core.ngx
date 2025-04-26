import { UteFontSizes } from "./font-sizes";
import { PageData } from "./page";

/**
 * Ute Core Configs Params
 * @prop {@link UteCoreConfigs.customFontSizes | customFontSizes}?: `UteFontSizes` - App year first build or production
 */
export interface UteCoreConfigs {
    /**
     * App year first build or production
     */
    customFontSizes?: UteFontSizes;
    /**
     * Source project environment file
     */
    environment: any;
    /**
     * Cookies expires time (days)
     * @default 30
     */
    cookiesExp?: number;
    /**
     * Custom path to locales files
     * @default `assets/locales/`
     */
    path?: string;
    /**
     * Always add locale tag to url
     */
    alwaysLocale?: boolean;
    /**
     * Api path part of link (after domain name)
     * @example
     * api
     * server/api
     * @default
     * api
     */
    api?: string;
    /**
     * Api sub domain
     * @example
     * api
     * api.server
     */
    subdomain?: string;
    /**
     * List of static pages
     */
    pages?: PageData[];
    /**
     * Set if app is standalone and use provider for init
     */
    standalone?: boolean;
}
