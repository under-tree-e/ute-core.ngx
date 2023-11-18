import { UteFontSizes } from "@ute/core/interfaces/font-sizes";

/**
 * Ute Core Configs Params
 * @prop {@link UteModuleConfigs.resizer | resizer}: `boolean` - Use app auto font resizer
 * @prop {@link UteModuleConfigs.customFontSizes | customFontSizes}?: `UteFontSizes` - App year first build or production
 */
export interface UteModuleConfigs {
    /**
     * Use app auto font resizer
     */
    resizer?: boolean;
    /**
     * App year first build or production
     */
    customFontSizes?: UteFontSizes;
}
