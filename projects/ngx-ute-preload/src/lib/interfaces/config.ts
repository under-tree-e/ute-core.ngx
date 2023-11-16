/**
 * Ute Preload Configs Params
 * @prop {@link UteModuleConfigs.version | version}: `string` - App version
 * @prop {@link UteModuleConfigs.year | year}?: `string` - App year first build or production
 * @prop {@link UteModuleConfigs.logo | logo}?: `string` - Image for load screen in base64 format
 */
export interface UteModuleConfigs {
    /**
     * App version string
     * @defaultValue `0.0.1`
     */
    version?: string;
    /**
     * App year first build or production
     * @defaultValue `2010`
     */
    year?: number;
    /**
     * Image for load screen in base64 format
     * @defaultValue `assets/logo.svg`
     */
    logo?: string;
    /**
     * Use custom html template
     */
    template?: string;
}
