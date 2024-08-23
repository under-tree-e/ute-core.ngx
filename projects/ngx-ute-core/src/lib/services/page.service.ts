import { Injectable } from "@angular/core";
import { PageData } from "../interfaces/page";
import { UteEnvironment } from "../interfaces/environment";

@Injectable({
    providedIn: "root",
})
export class PageService {
    private environment: UteEnvironment = {} as UteEnvironment;
    private pages: PageData[] = [];

    public Init(environment: UteEnvironment, pages?: PageData[]) {
        if (!environment.production) {
            console.log(`${new Date().toISOString()} => PageService`);
        }

        if (pages) this.pages = pages;
    }

    public getItems(include?: string | string[]): PageData[] {
        let pages = this.pages;
        if (include) {
            if (Array.isArray(include)) {
                pages = pages.filter((p: PageData) => include.some((ic: string) => ic === p.id));
            } else {
                pages = pages.filter((p: PageData) => p.id.includes(include));
            }
        }

        if (this.environment.session?.role) {
            return pages.filter((p: PageData) => p.roles.some((r: string) => r === this.environment.session?.role));
        } else {
            return pages;
        }
    }

    public getItemById(id: string): PageData | undefined {
        function flattenArray(arr: any[]) {
            return arr.reduce((acc, obj) => {
                if (obj.children) {
                    acc.push(...flattenArray(obj.children));
                } else {
                    acc.push(obj);
                }
                return acc;
            }, []);
        }
        return flattenArray(this.pages).find((item: PageData) => item.id.includes(id));
    }

    public getDefault(): string {
        return this.pages[0].id;
    }
}
