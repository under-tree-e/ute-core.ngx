import { ModuleWithProviders, NgModule } from "@angular/core";
import { PreloadService } from "./services/preload.service";
import { UteModuleConfigs } from "./interfaces/config";

/**
 * The main module of SQL Preload library. Example usage:
 *
 * ```typescript
 * import { NgxUtePreloadModule } from 'ngx-ute-preload';
 *
 * @NgModule({
 *      imports: [
 *          NgxUtePreloadModule.forRoot({
 *              name: "DB",
 *              db: "assets/databases/",
 *              model: "src/interfaces/models/",
 *              sync: false
 *          } as UteModuleConfigs)
 *      ]
 * })
 * class AppModule {}
 * ```
 *
 */
@NgModule({
    declarations: [],
    imports: [],
    exports: [],
})
export class NgxUtePreloadModule {
    /**
     * @param config - Ute Storage Configs Params `(UteModuleConfigs)`:
     *
     * - name: `string`</br>
     * - db?: `string`</br>
     * - model?: `string`</br>
     * - sync?: `boolean`</br>
     *
     * If `sync: true` Use example code to init storage:
     * @example
     * StorageService.initialize();
     *
     * @returns
     */
    static forRoot(config: UteModuleConfigs): ModuleWithProviders<NgxUtePreloadModule> {
        return {
            ngModule: NgxUtePreloadModule,
            providers: [PreloadService, { provide: "config", useValue: config }],
        };
    }
}
