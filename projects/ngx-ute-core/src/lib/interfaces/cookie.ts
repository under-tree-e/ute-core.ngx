export interface CookieTextsData {
    accept: string;
    acceptSelective: string;
    reject: string;
    text: string;
    title: string;
    expand: string;
    subTitle: string;
    subDesc: string;
    groupOneTitle: string;
    groupOneDesc: string;
    groupTwoTitle: string;
    groupTwoDesc: string;
    groupThreeTitle: string;
    groupThreeDesc: string;
    groupFourTitle: string;
    groupFourDesc: string;
    grouFiveTitle: string;
    groupFiveDesc: string;
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
