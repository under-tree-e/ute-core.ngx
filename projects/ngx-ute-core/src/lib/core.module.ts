import { LOCALE_ID, ModuleWithProviders, NgModule } from "@angular/core";
import { HttpClientModule, provideHttpClient, withFetch } from "@angular/common/http";

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
import { DelayIf } from "./pipes/delay-if.pipe";
import { HoldDirective } from "./directives/hold";
import { LengthCutPipe } from "./pipes/leng-cut.pipe";
import { SwipeDirective } from "./directives/swipe";
import { Paginator } from "./components/paginator/paginator";
import { SEOService } from "./services/seo.service";

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
    declarations: [],
    exports: [NumberStringPipe, StringFloatPipe, StringIntegerPipe, DateStringPipe, LangPipe, DelayIf, HoldDirective, LengthCutPipe, SwipeDirective, Paginator],
    imports: [LangPipe, NumberStringPipe, StringFloatPipe, StringIntegerPipe, DateStringPipe, DelayIf, LengthCutPipe, HoldDirective, SwipeDirective, Paginator],
    providers: [
        provideHttpClient(withFetch()),
        // Services
        HttpService,
        CookieService,
        LangService,
        SEOService,
        {
            provide: LOCALE_ID,
            useFactory: (service: LangService) => service.current(),
            deps: [LangService],
        },
        // Pipes
        NumberStringPipe,
        StringFloatPipe,
        StringIntegerPipe,
        DateStringPipe,
        LengthCutPipe,
        LangPipe,
        DelayIf,
        // Directives
        HoldDirective,
        SwipeDirective,
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
        console.log(100);

        return {
            ngModule: NgxUteCoreModule,
            providers: [CoreService, { provide: "UteCoreConfig", useValue: config }],
        };
    }
}
