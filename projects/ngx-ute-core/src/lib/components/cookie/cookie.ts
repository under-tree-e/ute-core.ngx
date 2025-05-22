// Module imports
import { AsyncPipe, NgClass, NgTemplateOutlet } from "@angular/common";
import { afterNextRender, Component, Input } from "@angular/core";
import { RouterModule } from "@angular/router";

// Project imports
import { LangPipe } from "../../pipes/lang.pipe";
import { CookieService } from "../../services/cookie.service";
import { CookieTextsData, CookieListData, CookieTypesData } from "../../interfaces/cookie";
import { HttpService } from "../../services/http.service";

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
    protected cookieList: CookieListData = {} as CookieListData;
    protected openGroup: any = {
        required: false,
        performance: false,
        functional: false,
        marketing: false,
        social: false,
    } as CookieTypesData;

    @Input() public cookieTexts: any = {
        accept: "Accept All",
        acceptSelective: "Accept Selective",
        reject: "Reject All",
        name: "Name",
        host: "Host",
        duration: "Duration",
        type: "Type",
        category: "Category",
        description: "Description",

        text: "We use cookies to provide you with the best possible user experience. You agree to our use of cookies and our Privacy policy.",

        title: "Individual privacy preferences",
        expand: "We use cookies and similar technologies on our website and process your personal data (e.g. IP address), for example, to personalize content and ads, to integrate media from third-party providers or to analyze traffic on our website. Data processing may also happen as a result of cookies being set. We share this data with third parties that we name in the privacy settings.\n\nThe data processing may take place with your consent or on the basis of a legitimate interest, which you can object to in the privacy settings. You have the right not to consent and to change or revoke your consent at a later time. For more information on the use of your data, please visit our Privacy policy.\n\nBelow you will find an overview of all services used by this website. You can view detailed information about each service and agree to them individually or exercise your right to object. Your consent is also applicable on devowl.io, newsletter.devowl.io.\n\nSome services process personal data in unsafe third countries. By consenting, you also consent to data processing of labeled services per Art. 49 (1) (a) GDPR, with risks like inadequate legal remedies, unauthorized access by authorities without information or possibility of objection, unauthorised transfer to third parties, and inadequate data security measures.\n\nYou are under 16 years old? Then you cannot consent to optional services. Ask your parents or legal guardians to agree to these services with you.",

        subTitle: "Non-standardized data processing",
        subDesc:
            'Some services set cookies and/or process personal data without complying with consent communication standards. These services are divided into several groups. So-called "essential services" are used based on legitimate interest and cannot be opted out (an objection may have to be made by email or letter in accordance with the Privacy policy), while all other services are used only after consent has been given.',

        requiredGroupTitle: "Required Cookies",
        requiredGroupDesc:
            "These cookies are necessary for our website to function and cannot be switched off in our systems. They are set in response to actions made by you and are considered as a request for services such as logging in, setting your privacy settings or making a purchase. You can set your browser to block or alert you about these cookies however, some parts of the site will not function as expected. These cookies do not store any personally identifiable information.",

        performanceGroupTitle: "Performance Cookies",
        performanceGroupDesc:
            "These cookies allow us to monitor traffic on our websites and make performance improvements based on how visitors navigate through the various pages. All information these cookies collect is aggregated and therefore anonymous. If you do not accept these cookies we will not know when you have visited our site and will not be able to monitor its performance.",

        functionalGroupTitle: "Functional Cookies",
        functionalGroupDesc:
            "These cookies allow us to provide you with enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages. If you do not allow these cookies, then some or all of these services may not function properly.",

        marketingGroupTitle: "Marketing Cookies",
        marketingGroupDesc:
            "Marketing cookies are used to build a profile of your interests and show you relevant advertisements for Blizzard and our affiliates’ products on other sites. They do not directly store your personal information but are based on uniquely identifying your browser and internet device. If you do not allow these cookies, you will still experience advertisements but they won’t be tailored to your interests.",

        socialGroupTitle: "Social Media Cookies",
        socialGroupDesc:
            "Social Media cookies are set by a range of social media services we have added to our sites to enable you to share our content with your friends and networks. They can track your browser across other sites and build up a profile of your interests that may affect the content and messages you see on other websites you visit. If you do not allow these cookies you may not be able to use or see these content sharing tools.",
    } as CookieTextsData;

    @Input() public cookieIcon: string = "";
    @Input() public cookieSVG: boolean = false;
    @Input() public cookieCancelIcon: string = "";
    @Input() public cookieAcceptIcon: string = "";
    @Input() public cookieCloseIcon: string = "";
    @Input() public cookieArrowIcon: string = "";
    @Input() public cookieLinks: any[] = [];

    /**
     * CookieBar constructor.
     * @param cookieService A service to manipulate cookies.
     * @param httpService A service to make HTTP requests.
     * @description
     * The component is initialized by calling the init method.
     * If the "CK" cookie is not set, the isCookies property is set to true,
     * which shows the cookie bar.
     */
    constructor(private readonly cookieService: CookieService, private readonly httpService: HttpService) {
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
            item = item.replace("Privacy policy", "<a href='/privacy'>Privacy policy</a>");
        });
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
