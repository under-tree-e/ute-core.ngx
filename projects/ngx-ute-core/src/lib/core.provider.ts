import { EnvironmentProviders, makeEnvironmentProviders, Provider } from "@angular/core";
import { UteCoreConfigs } from "./interfaces/config";
import { CoreService } from "./services/core.service";
import { SEOService } from "./services/seo.service";

export function provideCoreModule(config?: UteCoreConfigs): Provider[] {
    console.log(101.1);

    return [CoreService, { provide: "UteCoreConfig", useValue: config }];
}

export function provideNgxUteCore(config?: UteCoreConfigs): EnvironmentProviders {
    console.log(101);

    return makeEnvironmentProviders(provideCoreModule(config));
}
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////

// import { importProvidersFrom, LOCALE_ID } from "@angular/core";
// import { provideHttpClient } from "@angular/common/http";
// import { OnlineStatusService } from "ngx-online-status";

// import { CoreService } from "./services/core.service";
// import { CookieService } from "./services/cookie.service";
// import { HttpService } from "./services/http.service";
// import { LangService } from "./services/lang.service";

// import { UteCoreConfigs } from "./interfaces/config";

// import { NumberStringPipe } from "./pipes/number-string.pipe";
// import { StringFloatPipe } from "./pipes/string-float.pipe";
// import { StringIntegerPipe } from "./pipes/string-int.pipe";
// import { DateStringPipe } from "./pipes/date-string.pipe";
// import { LangPipe } from "./pipes/lang.pipe";
// import { DelayIf } from "./pipes/delay-if.pipe";
// import { HoldDirective } from "./directives/hold";
// import { LengthCutPipe } from "./pipes/leng-cut.pipe";
// import { SwipeDirective } from "./directives/swipe";
// import { Paginator } from "./components/paginator/paginator";

// /**
//  * The provider configuration for standalone Angular app.
//  *
//  * Usage:
//  * ```typescript
//  * import { provideNgxUteCore } from 'ngx-ute-core';
//  *
//  * bootstrapApplication(AppComponent, {
//  *   providers: [provideNgxUteCore({
//  *     resizer: true,
//  *     customFontSizes: {...},
//  *   } as UteCoreConfigs)]
//  * });
//  * ```
//  */
// export function provideNgxUteCore(config: UteCoreConfigs) {
//     console.log(101);

//     return [
//         CoreService,
//         { provide: "UteCoreConfig", useValue: config },
//         // NumberStringPipe,
//         // StringFloatPipe,
//         // StringIntegerPipe,
//         // DateStringPipe,
//         LangPipe,
//         { provide: "LangPipe", useClass: LangPipe },
//         // DelayIf,
//         // HoldDirective,
//         // LengthCutPipe,
//         // SwipeDirective,
//         // Paginator,
//         // CookieService,
//         // OnlineStatusService,
//         // SwipeDirective,
//         {
//             provide: LOCALE_ID,
//             useFactory: (service: LangService) => service.current(),
//             deps: [LangService],
//         },
//         provideHttpClient(),
//         HttpService,
//         importProvidersFrom(CoreService, LangPipe, NumberStringPipe, StringFloatPipe, StringIntegerPipe, DateStringPipe, DelayIf, LengthCutPipe, HoldDirective, SwipeDirective, Paginator),
//     ];
// }
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

// import { EnvironmentProviders, LOCALE_ID, makeEnvironmentProviders } from "@angular/core";
// import { UteCoreConfigs } from "./interfaces/config";
// import { CoreService } from "./services/core.service";
// import { NumberStringPipe } from "./pipes/number-string.pipe";
// import { StringFloatPipe } from "./pipes/string-float.pipe";
// import { StringIntegerPipe } from "./pipes/string-int.pipe";
// import { DateStringPipe } from "./pipes/date-string.pipe";
// import { LengthCutPipe } from "./pipes/leng-cut.pipe";
// import { LangPipe } from "./pipes/lang.pipe";
// import { DelayIf } from "./pipes/delay-if.pipe";
// import { HoldDirective } from "./directives/hold";
// import { CookieService } from "./services/cookie.service";
// import { OnlineStatusService } from "ngx-online-status";
// import { HttpService } from "./services/http.service";
// import { SwipeDirective } from "./directives/swipe";
// import { LangService } from "./services/lang.service";

// /**
//  * @param config - Ute Core Configs Params `(UteCoreConfigs)`:
//  *
//  * - resizer?: `boolean`</br>
//  * - customFontSizes?: `UteFontSizes`
//  * - cookiesExp?: `number`
//  * - environment: `Object`
//  *
//  */
// export function provideNgxUteCore(config: UteCoreConfigs): EnvironmentProviders {
//     return makeEnvironmentProviders([
//         // NumberStringPipe,
//         // StringFloatPipe,
//         // StringIntegerPipe,
//         // DateStringPipe,
//         // LengthCutPipe,
//         LangPipe,
//         {
//             provide: "LangPipe",
//             useClass: LangPipe,
//         },
//         // DelayIf,
//         // HoldDirective,
//         // CookieService,
//         // OnlineStatusService,
//         // HttpService,
//         // SwipeDirective,
//         {
//             provide: LOCALE_ID,
//             useFactory: (service: LangService) => service.current(),
//             deps: [LangService],
//         },
//         {
//             provide: "LangService",
//             useClass: LangService,
//         },
//         CoreService,
//         {
//             provide: "UteCoreConfig",
//             useValue: config,
//         },
//     ]);
// }
