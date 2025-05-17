// Module imports
import { AsyncPipe, NgClass } from "@angular/common";
import { afterNextRender, Component, Input } from "@angular/core";
import { RouterModule } from "@angular/router";

// Project imports
import { LangPipe } from "../../pipes/lang.pipe";
import { CookieService } from "../../services/cookie.service";
import { CookieTextsData, CookieListData, CookieTypesData } from "../../interfaces/cookie";

@Component({
    selector: "ute-cookies",
    templateUrl: "./cookie.html",
    standalone: true,
    imports: [RouterModule, AsyncPipe, LangPipe, NgClass],
})
export class CookieBar {
    protected isCookies: boolean = false;
    protected isDialog: boolean = false;
    protected cookieTypes: CookieTypesData = {
        required: true,
        performance: true,
        functional: true,
        marketing: true,
        social: true,
    };

    @Input() public cookieTexts: CookieTextsData = {
        accept: "Accept All",
        text: "We use cookies to provide you with the best possible user experience. You agree to our use of cookies and our privacy policy.",

        title: "Individual privacy preferences",
        expand: "We use cookies and similar technologies on our website and process your personal data (e.g. IP address), for example, to personalize content and ads, to integrate media from third-party providers or to analyze traffic on our website. Data processing may also happen as a result of cookies being set. We share this data with third parties that we name in the privacy settings.\nThe data processing may take place with your consent or on the basis of a legitimate interest, which you can object to in the privacy settings. You have the right not to consent and to change or revoke your consent at a later time. For more information on the use of your data, please visit our privacy policy.\nBelow you will find an overview of all services used by this website. You can view detailed information about each service and agree to them individually or exercise your right to object. Your consent is also applicable on devowl.io, newsletter.devowl.io.\nSome services process personal data in unsafe third countries. By consenting, you also consent to data processing of labeled services per Art. 49 (1) (a) GDPR, with risks like inadequate legal remedies, unauthorized access by authorities without information or possibility of objection, unauthorised transfer to third parties, and inadequate data security measures.\nYou are under 16 years old? Then you cannot consent to optional services. Ask your parents or legal guardians to agree to these services with you.",

        subTitle: "Non-standardized data processing",
        subDesc:
            'Some services set cookies and/or process personal data without complying with consent communication standards. These services are divided into several groups. So-called "essential services" are used based on legitimate interest and cannot be opted out (an objection may have to be made by email or letter in accordance with the privacy policy), while all other services are used only after consent has been given.',

        groupOneTitle: "Required Cookies",
        groupOneDesc:
            "These cookies are necessary for our website to function and cannot be switched off in our systems. They are set in response to actions made by you and are considered as a request for services such as logging in, setting your privacy settings or making a purchase. You can set your browser to block or alert you about these cookies however, some parts of the site will not function as expected. These cookies do not store any personally identifiable information.",

        groupTwoTitle: "Performance Cookies",
        groupTwoDesc:
            "These cookies allow us to monitor traffic on our websites and make performance improvements based on how visitors navigate through the various pages. All information these cookies collect is aggregated and therefore anonymous. If you do not accept these cookies we will not know when you have visited our site and will not be able to monitor its performance.",

        groupThreeTitle: "Functional Cookies",
        groupThreeDesc:
            "These cookies allow us to provide you with enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages. If you do not allow these cookies, then some or all of these services may not function properly.",

        groupFourTitle: "Marketing Cookies",
        groupFourDesc:
            "Marketing cookies are used to build a profile of your interests and show you relevant advertisements for Blizzard and our affiliates’ products on other sites. They do not directly store your personal information but are based on uniquely identifying your browser and internet device. If you do not allow these cookies, you will still experience advertisements but they won’t be tailored to your interests.",

        grouFiveTitle: "Social Media Cookies",
        groupFiveDesc:
            "Social Media cookies are set by a range of social media services we have added to our sites to enable you to share our content with your friends and networks. They can track your browser across other sites and build up a profile of your interests that may affect the content and messages you see on other websites you visit. If you do not allow these cookies you may not be able to use or see these content sharing tools.",
    };

    @Input() public cookieIcon: string = "";
    @Input() public cookieList: CookieListData = {} as CookieListData;

    constructor(private readonly cookieService: CookieService) {
        if (!this.cookieService.get("CK")) {
            afterNextRender(() => {
                this.isCookies = true;
            });
        }
    }

    protected isContent(element: any) {
        return !!element.children.length;
    }

    protected acceptCookie() {
        this.cookieService.set("CK", this.cookieTypes);
    }

    protected selectCookie(selected: any) {
        this.cookieService.set("CK", selected);
    }
}
