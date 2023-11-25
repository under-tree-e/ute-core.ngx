import { LOCALE_ID, ModuleWithProviders, NgModule } from "@angular/core";
import { CoreService } from "./services/core.service";
import { UteCoreConfigs } from "./interfaces/config";
import { NumberStringPipe } from "./pipes/number-string.pipe";
import { StringFloatPipe } from "./pipes/string-float.pipe";
import { StringIntegerPipe } from "./pipes/string-int.pipe";
import { DateStringPipe } from "./pipes/date-string.pipe";
import { DatePipe, DecimalPipe } from "@angular/common";

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
 *          } as UteCoreConfigs)
 *      ]
 * })
 * class AppModule {}
 * ```
 *
 */
@NgModule({
    declarations: [NumberStringPipe, StringFloatPipe, StringIntegerPipe, DateStringPipe],
    exports: [NumberStringPipe, StringFloatPipe, StringIntegerPipe, DateStringPipe],
    imports: [DatePipe, DecimalPipe],
    providers: [NumberStringPipe, StringFloatPipe, StringIntegerPipe, DateStringPipe, DatePipe, { provide: LOCALE_ID, useValue: "en-US" }],
})
export class NgxUteCoreModule {
    /**
     * @param config - Ute Core Configs Params `(UteCoreConfigs)`:
     *
     * - resizer?: `boolean`</br>
     * - customFontSizes?: `UteFontSizes`
     *
     */
    static forRoot(config?: UteCoreConfigs): ModuleWithProviders<NgxUteCoreModule> {
        return {
            ngModule: NgxUteCoreModule,
            providers: [CoreService, { provide: "UteCoreConfig", useValue: config }],
        };
    }
}
