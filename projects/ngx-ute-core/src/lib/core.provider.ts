import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { UteCoreConfigs } from "./interfaces/config";
import { CoreService } from "./services/core.service";

/**
 * @param config - Ute Core Configs Params `(UteCoreConfigs)`:
 *
 * - resizer?: `boolean`</br>
 * - customFontSizes?: `UteFontSizes`
 * - cookiesExp?: `number`
 * - environment: `Object`
 *
 */
export function provideNgxUteCore(config: UteCoreConfigs): EnvironmentProviders {
    return makeEnvironmentProviders([
        CoreService,
        {
            provide: "UteCoreConfig",
            useValue: config,
        },
    ]);
}
