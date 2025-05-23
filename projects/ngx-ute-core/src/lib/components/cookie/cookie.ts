// Module imports
import { AsyncPipe, NgClass, NgTemplateOutlet } from "@angular/common";
import { afterNextRender, Component, Input } from "@angular/core";
import { RouterModule } from "@angular/router";

// Project imports
import { LangPipe } from "../../pipes/lang.pipe";
import { CookieService } from "../../services/cookie.service";
import { CookieTextsData, CookieListData, CookieTypesData } from "../../interfaces/cookie";
import { HttpService } from "../../services/http.service";
import { CookiseTextsData } from "../../constantes/cookie";

@Component({
    selector: "ute-cookies",
    templateUrl: "./cookie.html",
    standalone: true,
    imports: [RouterModule, AsyncPipe, LangPipe, NgClass, NgTemplateOutlet],
})
export class CookieBar {
    protected isCookies: boolean = false;
    protected isDialog: boolean = false;
    protected cookieTypes: any = {
        required: true,
        performance: true,
        functional: true,
        marketing: true,
        social: true,
    } as CookieTypesData;
    protected cookieList: any = {} as CookieListData;
    protected openGroup: any = {
        required: false,
        performance: false,
        functional: false,
        marketing: false,
        social: false,
    } as CookieTypesData;

    protected cookieTexts: any = CookiseTextsData as CookieTextsData;

    @Input() public cookieIcon: string = "";
    @Input() public cookieCancelIcon: string = "";
    @Input() public cookieAcceptIcon: string = "";
    @Input() public cookieCloseIcon: string = "";
    @Input() public cookieArrowIcon: string = "";
    @Input() public cookiePolicyLink: string = "#";

    /**
     * CookieBar constructor.
     * @param cookieService A service to manipulate cookies.
     * @param httpService A service to make HTTP requests.
     * @description
     * The component is initialized by calling the init method.
     * If the "CK" cookie is not set, the isCookies property is set to true,
     * which shows the cookie bar.
     */
    constructor(private readonly cookieService: CookieService, private readonly httpService: HttpService, private readonly langPipe: LangPipe) {
        if (!this.cookieService.get("CK")) {
            afterNextRender(() => {
                this.isCookies = true;
            });
        }

        this.init();
    }

    /**
     * Initializes the cookie list and updates text placeholders.
     *
     * This method asynchronously loads the cookie data from a local JSON file
     * and assigns it to the `cookieList` property. It also iterates over the
     * `cookieTexts` to replace "Privacy policy" with a hyperlink to the privacy
     * policy page.
     */
    private init() {
        (async () => {
            this.cookieList = await this.httpService.httpLocal("assets/cookies.json");
        })();
        Object.values(this.cookieTexts).forEach((item: any) => {
            item = item.replace("Privacy policy", `<a href='${this.cookiePolicyLink}'>Privacy policy</a>`);
        });
    }

    /**
     * Retrieves a translated text for a given key from the cookieTexts object.
     *
     * If the key is not found in the cookieTexts object, it returns the original key.
     *
     * @param text The key to retrieve the text for.
     * @returns The translated text or the original key if the key is not found.
     */
    protected getCookieText(text: string) {
        let cookieText: string = this.langPipe.transform(text, true);
        if (cookieText) {
            cookieText = cookieText.replace("Privacy policy", `<a href='${this.cookiePolicyLink}'>Privacy policy</a>`);
            return cookieText;
        } else {
            return this.cookieTexts[text];
        }
    }

    /**
     * Checks if an element has any child nodes.
     *
     * This method is used to check if an element has any content before rendering.
     * It returns true if the element has any child nodes, false otherwise.
     *
     * @param element Any HTML element.
     * @returns true if the element has any child nodes, false otherwise.
     */
    protected isContent(element: any) {
        return !!element.children.length;
    }

    /**
     * Accepts all cookie types and updates the stored cookies.
     *
     * This method iterates over all available cookie types, setting each one to true,
     * indicating acceptance. It then calls the `setCookies` method to update the stored
     * cookies accordingly.
     */
    public acceptCookie() {
        Object.keys(this.cookieTypes).forEach((key) => {
            this.cookieTypes[key] = true;
        });
        this.setCookies();
    }

    /**
     * Opens the cookie dialog.
     *
     * This method sets the `isDialog` property to true and sets the overflow of the
     * document body to "hidden" to prevent scrolling while the dialog is open.
     */
    public editCookie() {
        this.isDialog = true;
        document.body.style.overflow = "hidden";
    }

    /**
     * Rejects all cookie types and updates the stored cookies.
     *
     * This method iterates over all available cookie types, setting each one to false,
     * indicating rejection. It then sets the "required" cookie type to true, as it must
     * always be accepted. Finally, it calls the `setCookies` method to update the stored
     * cookies accordingly.
     */
    protected rejectCookie() {
        Object.keys(this.cookieTypes).forEach((key) => {
            this.cookieTypes[key] = false;
        });
        this.cookieTypes.required = true;
    }

    /**
     * Saves the current state of the cookie types to a cookie named "CK" and closes the cookie dialog.
     *
     * This method is called whenever the user changes their cookie preferences. It sets a cookie named "CK"
     * to the current state of the `cookieTypes` property and then calls the `onClose` method to close the
     * cookie dialog.
     */
    protected setCookies() {
        this.cookieService.set("CK", this.cookieTypes);
        this.onClose();
    }

    /**
     * Closes the cookie dialog.
     *
     * This method is called whenever the user closes the cookie dialog, either by clicking on the close button
     * or by pressing the escape key. It sets the `isDialog` property to false and sets the overflow of the document
     * body back to its default value, allowing the user to scroll again.
     */
    protected onClose() {
        this.isDialog = false;
        document.body.style.overflow = "";
    }
}
