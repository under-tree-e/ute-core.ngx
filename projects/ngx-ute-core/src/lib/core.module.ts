import { ModuleWithProviders, NgModule } from "@angular/core";
import { CoreService } from "@ute/core/services/core.service";
import { UteModuleConfigs } from "@ute/core/interfaces/config";

/**
 * The main module of Core library. Example usage:
 *
 * ```typescript
 * import { NgxUteCoreModule } from 'ngx-ute-core';
 *
 * @NgModule({
 *      imports: [
 *          NgxUteCoreModule.forRoot({
 *              resizer: true,
 *              customFontSizes: {...},
 *          } as UteModuleConfigs)
 *      ]
 * })
 * class AppModule {}
 * ```
 *
 */
@NgModule()
export class NgxUteCoreModule {
    /**
     * @param config - Ute Core Configs Params `(UteModuleConfigs)`:
     *
     * - resizer?: `boolean`</br>
     * - customFontSizes?: `UteFontSizes`
     *
     */
    static forRoot(config: UteModuleConfigs): ModuleWithProviders<NgxUteCoreModule> {
        return {
            ngModule: NgxUteCoreModule,
            providers: [CoreService, { provide: "config", useValue: config }],
        };
    }
}
