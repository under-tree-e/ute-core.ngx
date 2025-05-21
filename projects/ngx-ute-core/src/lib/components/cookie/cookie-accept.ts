// Module imports
import { Directive, HostListener } from "@angular/core";

// Project imports
import { CookieBar } from "./cookie";

@Directive({
    selector: "[cookieAccept]",
    standalone: true,
})
export class CookieAcceptDirective {
    constructor(private readonly cookieBar: CookieBar) {}

    @HostListener("click")
    /**
     * Handles the click event to accept cookies.
     * Calls the acceptCookie method on the CookieBar instance.
     */
    onClick() {
        this.cookieBar.acceptCookie();
    }
}
