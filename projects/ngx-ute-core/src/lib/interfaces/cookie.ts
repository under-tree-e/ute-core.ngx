export interface CookieTextsData {
    cookieAccept: string;
    cookieAcceptSelective: string;
    cookieReject: string;
    cookieName: string;
    cookieHost: string;
    cookieDuration: string;
    cookieType: string;
    cookieCategory: string;
    cookieDescription: string;
    cookieText: string;
    cookieTitle: string;
    cookieExpand: string;
    cookieSubTitle: string;
    cookieSubDesc: string;
    cookierequiredGroupTitle: string;
    cookierequiredGroupDesc: string;
    cookieperformanceGroupTitle: string;
    cookieperformanceGroupDesc: string;
    cookiefunctionalGroupTitle: string;
    cookiefunctionalGroupDesc: string;
    cookiemarketingGroupTitle: string;
    cookiemarketingGroupDesc: string;
    cookiesocialGroupTitle: string;
    cookiesocialGroupDesc: string;
    cookiePolicy: string;
}

export interface CookieTypesData {
    required: boolean;
    performance: boolean;
    functional: boolean;
    marketing: boolean;
    social: boolean;
}

export interface CookieListData {
    required: CookieItemData[];
    performance: CookieItemData[];
    functional: CookieItemData[];
    marketing: CookieItemData[];
    social: CookieItemData[];
}

export interface CookieItemData {
    name: string;
    host: string;
    duration: number;
    type: string;
    category: string;
    description?: string;
}
