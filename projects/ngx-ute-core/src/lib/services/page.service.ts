import { Injectable } from "@angular/core";
import { PageData } from "../interfaces/page";
import { SessionData } from "../interfaces/session";
import { UteEnvironment } from "../interfaces/environment";

@Injectable({
    providedIn: "root",
})
export class PageService {
    private session: SessionData = {} as SessionData;
    private pages: PageData[] = [];

    public Init(env: UteEnvironment, pages?: PageData[]) {
        if (env.session) this.session = env.session;
        if (pages) this.pages = pages;
    }

    public getItems(): PageData[] {
        if (this.session?.role) {
            return this.pages.filter((p: PageData) => p.roles.some((r: string) => r === this.session?.role));
        } else {
            return this.pages;
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
        return flattenArray(this.pages).find((item: PageData) => id.includes(item.id));
    }

    public getDefault(): string {
        return this.pages[0].id;
    }
}
