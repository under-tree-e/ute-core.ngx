// Module imports
import { AsyncPipe, NgClass } from "@angular/common";
import { Component, Input } from "@angular/core";
import { RouterModule } from "@angular/router";

// Project imports
import { LangPipe } from "../../pipes/lang.pipe";
import { TemplatePortal } from "@angular/cdk/portal";

@Component({
    selector: "ute-cookies",
    templateUrl: "./cookie.html",
    standalone: true,
    imports: [RouterModule, AsyncPipe, LangPipe, NgClass],
})
export class CookieBar {
    public buttonsPortal: TemplatePortal = null!;

    @Input() public cookieAccept: string = "Accept All";
    @Input() public cookieIcon: any = null;

    protected acceptCookie() {}

    protected settingCookie() {}
}
