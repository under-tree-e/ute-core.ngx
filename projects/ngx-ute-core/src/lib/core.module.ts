import { LOCALE_ID, ModuleWithProviders, NgModule } from "@angular/core";
import { OnlineStatusService } from "ngx-online-status";

import { CoreService } from "./services/core.service";
import { CookieService } from "./services/cookie.service";
import { HttpService } from "./services/http.service";
import { LangService } from "./services/lang.service";

import { UteCoreConfigs } from "./interfaces/config";

import { NumberStringPipe } from "./pipes/number-string.pipe";
import { StringFloatPipe } from "./pipes/string-float.pipe";
import { StringIntegerPipe } from "./pipes/string-int.pipe";
import { DateStringPipe } from "./pipes/date-string.pipe";
import { LangPipe } from "./pipes/lang.pipe";

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
    declarations: [NumberStringPipe, StringFloatPipe, StringIntegerPipe, DateStringPipe, LangPipe],
    exports: [NumberStringPipe, StringFloatPipe, StringIntegerPipe, DateStringPipe, LangPipe],
    providers: [
        NumberStringPipe,
        StringFloatPipe,
        StringIntegerPipe,
        DateStringPipe,
        LangPipe,
        CookieService,
        OnlineStatusService,
        HttpService,
        {
            provide: LOCALE_ID,
            useFactory: (service: LangService) => service.current(),
            deps: [LangService],
        },
    ],
})
export class NgxUteCoreModule {
    /**
     * @param config - Ute Core Configs Params `(UteCoreConfigs)`:
     *
     * - resizer?: `boolean`</br>
     * - customFontSizes?: `UteFontSizes`
     * - cookiesExp?: `number`
     * - environment: `Object`
     *
     */
    static forRoot(config: UteCoreConfigs): ModuleWithProviders<NgxUteCoreModule> {
        return {
            ngModule: NgxUteCoreModule,
            providers: [CoreService, { provide: "UteCoreConfig", useValue: config }],
        };
    }
}
