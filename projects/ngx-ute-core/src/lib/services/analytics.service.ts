/* Module imports */
import { Injectable } from "@angular/core";

/* Project imports */

declare global {
    interface Window {
        dataLayer?: any[];
        gtag?(...args: any[]): void;
        /** Legacy Universal Analytics `analytics.js` field. */
        ga?(...args: any[]): void;
    }
}

@Injectable({
    providedIn: "root",
})
export class AnalyticsService {
    /**
     * Initializes Google Tag Manager tracking.
     *
     * @param {string} gtag The property ID from the Google Tag Manager web UI.
     */
    public Init(gtag: string) {
        const url = `https://www.googletagmanager.com/gtag/js?id=${gtag}`;

        // Note: This cannot be an arrow function as `gtag.js` expects an actual `Arguments`
        // instance with e.g. `callee` to be set. Do not attempt to change this and keep this
        // as much as possible in sync with the tracking code snippet suggested by the Google
        // Analytics 4 web UI under `Data Streams`.
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
            window.dataLayer?.push(arguments);
        };
        window.gtag("js", new Date());

        // Configure properties before loading the script. This is necessary to avoid
        // loading multiple instances of the gtag JS scripts.
        window.gtag("config", gtag);

        // skip `gtag` for Protractor e2e tests.
        if (window.name.includes("NG_DEFER_BOOTSTRAP")) {
            return;
        }

        const el = window.document.createElement("script");
        el.async = true;
        el.src = url;
        window.document.head.appendChild(el);
    }
}
