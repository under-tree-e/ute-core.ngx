import { APP_INITIALIZER, LOCALE_ID } from "@angular/core";
import { UteCoreConfigs } from "./interfaces/config";
import { CoreService } from "./services/core.service";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { NumberStringPipe } from "./pipes/number-string.pipe";
import { StringFloatPipe } from "./pipes/string-float.pipe";
import { StringIntegerPipe } from "./pipes/string-int.pipe";
import { DateStringPipe } from "./pipes/date-string.pipe";
import { LengthCutPipe } from "./pipes/leng-cut.pipe";
import { LangPipe } from "./pipes/lang.pipe";
import { DelayIf } from "./pipes/delay-if.pipe";
import { HoldDirective } from "./directives/hold";
import { CookieService } from "./services/cookie.service";
import { HttpService } from "./services/http.service";
import { SwipeDirective } from "./directives/swipe";
import { SEOService } from "./services/seo.service";
import { LangService } from "./services/lang.service";

/**
 * The provider configuration for standalone Angular app.
 *
 * Usage:
 * ```typescript
 * import { provideNgxUteCore } from 'ngx-ute-core';
 *
 * bootstrapApplication(AppComponent, {
 *   providers: [provideNgxUteCore({
 *     customFontSizes: {...},
 *   } as UteCoreConfigs)]
 * });
 * ```
 */
export function provideNgxUteCore(config: UteCoreConfigs) {
    return [
        provideHttpClient(withFetch()),
        // Services
        CoreService,
        { provide: "UteCoreConfig", useValue: config },
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
        {
            provide: APP_INITIALIZER,
            useFactory: (config: CoreService) => () => config,
            multi: true,
            deps: [CoreService],
        },
    ];
}
