import { Injectable } from "@angular/core";
import { PageData } from "../interfaces/page";
import { UteEnvironment } from "../interfaces/environment";

@Injectable({
    providedIn: "root",
})
export class PageService {
    private environment: UteEnvironment = {} as UteEnvironment;
    private pages: PageData[] = [];
    private serverLink: string = "";

    public Init(environment: UteEnvironment, pages?: PageData[]) {
        this.environment = environment;
        this.serverLink = this.environment.appServer ? this.environment.appServer : "";
        if (!this.serverLink.endsWith("/")) {
            this.serverLink += "/";
        }
        if (!environment.production) {
            console.log(`${new Date().toISOString()} => PageService`);
        }

        if (pages) this.pages = pages;
    }

    public getItems(include?: string | string[]): PageData[] {
        let pages = this.pages;
        if (include) {
            if (Array.isArray(include)) {
                pages = pages.filter((p: PageData) => include.some((ic: string) => ic === p.id || ic === p.group));
            } else {
                pages = pages.filter((p: PageData) => p.id.includes(include) || p.group === include);
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

    public contentMaker(data: any): any {
        if (!data) {
            return [];
        }

        let result: any = {};

        data = this.buildHierarchy(data, { simple: true });
        data.map((f1: any) => {
            if (f1.children && f1.children.length) {
                result[f1.code] = [];
                f1.children.map((fc: any) => {
                    let elem: any = {};
                    fc.contents.map((f2: any) => {
                        elem[f2.code] = this.getData(f2);
                    });
                    result[f1.code].push(elem);
                });
            } else if (f1.contents && f1.contents.length) {
                result[f1.code] = {};
                f1.contents.map((f2: any) => {
                    result[f1.code][f2.code] = this.getData(f2);
                });
            } else {
                result[f1.code] = this.getData(f1);
            }
        });
        return result;
    }

    private getData(data: any) {
        try {
            switch (data.type) {
                case "input":
                case "textarea":
                case "editor":
                case "link":
                    return data.content;
                case "image":
                    return `${this.serverLink}api/media/${data.media.thumbnail}.${data.media.ex}`;
                case "video":
                    return `${this.serverLink}api/media/${data.media.name}.${data.media.ex}`;
            }
        } catch (error) {
            console.error(error);
            return "";
        }
    }

    public buildHierarchy(data: any[], options?: { simple?: boolean; key?: string }) {
        const map = new Map();

        if (!options?.simple) {
            if (data.length) {
                data.map((cd: any) => {
                    if (cd.media) {
                        cd.media.thumb = cd.media.thumbnail ? `${this.serverLink}api/media/${cd.media.thumbnail}.${cd.media.ex}` : cd.media.image;
                    }
                });
            }
        }

        // Initialize map with all nodes
        data.forEach((item) => {
            map.set(item.uid, { ...item, contents: [] });
        });

        let root: any[] = [];
        const keyName: string = options?.key ?? "children";

        // Assign children to parents
        data.forEach((item) => {
            if (item.parent === null) {
                root.push(map.get(item.uid));
            } else {
                const parent = map.get(item.parent);
                if (parent) {
                    if (parent.type === "copy" && !parent.parent) {
                        if (item.type === "copy") {
                            if (!parent[keyName] || (parent[keyName] && !parent[keyName].length)) {
                                parent[keyName] = [];
                            }
                            parent[keyName].push(map.get(item.uid));
                            if (item.position) {
                                parent[keyName].sort((a: any, b: any) => a.position - b.position);
                            }
                        } else {
                            parent[keyName].push(map.get(item.uid));
                            if (item.position) {
                                parent[keyName].sort((a: any, b: any) => a.position - b.position);
                            }
                        }
                    } else {
                        parent[keyName].push(map.get(item.uid));
                        if (item.position) {
                            parent[keyName].sort((a: any, b: any) => a.position - b.position);
                        }
                    }
                }
            }
        });

        return root;
    }
}
