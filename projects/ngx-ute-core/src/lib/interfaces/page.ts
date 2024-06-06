export interface PageData {
    id: string;
    icon: string;
    name: string;
    desk: string;
    keys?: string;
    pipe?: boolean;
    children?: PageData[];
    roles: any[];
}
