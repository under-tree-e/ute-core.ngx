export interface PageData {
    id: string;
    icon: string;
    name: string;
    desc: string;
    keys?: string;
    pipe?: boolean;
    children?: PageData[];
    roles: any[];
    group?: string;
}

export interface PageGroupsData {
    code: string;
    name: string;
}

export interface PageLimitItems {
    step: number;
    start: number;
}
