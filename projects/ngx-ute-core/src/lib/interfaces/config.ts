import { UteEnvironment } from "./environment";
import { UteFontSizes } from "./font-sizes";

/**
 * Ute Core Configs Params
 * @prop {@link UteCoreConfigs.resizer | resizer}: `boolean` - Use app auto font resizer
 * @prop {@link UteCoreConfigs.customFontSizes | customFontSizes}?: `UteFontSizes` - App year first build or production
 */
export interface UteCoreConfigs {
    /**
     * Use app auto font resizer
     */
    resizer?: boolean;
    /**
     * App year first build or production
     */
    customFontSizes?: UteFontSizes;
    /**
     * Source project environment file
     */
    environment: UteEnvironment | any;
    /**
     * Cookies expires time (days)
     * @default 30
     */
    cookiesExp?: number;
}
