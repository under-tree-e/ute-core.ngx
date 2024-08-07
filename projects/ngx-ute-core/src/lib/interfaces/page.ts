export interface PageData {
    id: string;
    icon: string;
    name: string;
    desc: string;
    keys?: string;
    pipe?: boolean;
    children?: PageData[];
    roles: any[];
}
