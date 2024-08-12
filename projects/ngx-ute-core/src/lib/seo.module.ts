import { NgModule } from "@angular/core";
import { HttpClientModule, provideHttpClient, withFetch } from "@angular/common/http";
import { BrowserModule } from "@angular/platform-browser";

import { SEOService } from "./services/seo.service";
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [],
    // exports: [SEOService],
    imports: [],
    providers: [SEOService],
    // providers: [SEOService, provideHttpClient(withFetch())],
    // providers: [SEOService, HttpClientModule],
})
export class NgxUteSEOModule {}
