import { APP_INITIALIZER, LOCALE_ID } from "@angular/core";
import { provideHttpClient, withFetch } from "@angular/common/http";

import { UteCoreConfigs } from "./interfaces/config";
import { CoreService } from "./services/core.service";
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
import { DataLangPipe } from "./pipes/datalang.pipe";
import { SliderDirective } from "../public-api";

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
    config.standalone = true;
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
        DataLangPipe,
        DelayIf,
        // Directives
        HoldDirective,
        SwipeDirective,
        SliderDirective,
        {
            provide: APP_INITIALIZER,
            useFactory: (config: CoreService) => () => config.Init(),
            multi: true,
            deps: [CoreService],
        },
    ];
}
