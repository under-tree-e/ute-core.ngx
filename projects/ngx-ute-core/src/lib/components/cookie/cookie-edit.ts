// Module imports
import { Directive, HostListener } from "@angular/core";

// Project imports
import { CookieBar } from "./cookie";

@Directive({
    selector: "[cookieEdit]",
    standalone: true,
})
export class CookieEditDirective {
    constructor(private readonly cookieBar: CookieBar) {}

    @HostListener("click")
    /**
     * Handles the click event to edit cookies.
     * Invokes the editCookie method on the CookieBar instance.
     */
    onClick() {
        this.cookieBar.editCookie();
    }
}
