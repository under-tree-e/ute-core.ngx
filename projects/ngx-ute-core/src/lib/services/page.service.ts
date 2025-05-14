/* Module imports */
import { Injectable } from "@angular/core";

/* Project imports */
import { PageData } from "../interfaces/page";
import { UteEnvironment } from "../interfaces/environment";

@Injectable({
    providedIn: "root",
})
export class PageService {
    private environment: UteEnvironment = {} as UteEnvironment;
    private pages: PageData[] = [];
    private serverLink: string = "";

    /**
     * @param environment - The environment settings
     * @param pages - The page setting for the app
     *
     * Init the page service with the environment settings and the page settings.
     * If the page settings are not provided, the page service will use the default page settings.
     * If the environment setting production is false, the page service will log a message to the console.
     * The page service will also set the server link to the app server link with a slash at the end.
     */
    public Init(environment: UteEnvironment, pages?: PageData[]) {
        this.environment = environment;

        this.serverLink = this.environment.appServer ?? "";
        if (!this.serverLink.endsWith("/")) {
            this.serverLink += "/";
        }
        if (!environment.production) {
            console.log(`${new Date().toISOString()} => PageService`);
        }

        if (pages) this.pages = pages;
    }

    /**
     * Return the list of pages that match the given criteria.
     * @param include - The criteria to filter the pages. Can be a string or an array of strings.
     *                  If a string, it will filter the pages by id or group.
     *                  If an array, it will filter the pages by id or group for each string in the array.
     * @returns The list of pages that match the given criteria.
     *          If the session role is set, it will also filter the pages by role.
     */
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
            return pages.filter((p: PageData) => p.roles.length === 0 || p.roles.some((r: string) => r === this.environment.session?.role));
        } else {
            return pages;
        }
    }

    /**
     * Returns the page with the given id. If the id is not found, it will return undefined.
     * @param id - The id of the page to search for.
     * @returns The page with the given id, or undefined if not found.
     */
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

    /**
     * Returns the id of the first page in the list. This is the default page when
     * the user lands on the app without a page specified.
     * @returns The id of the first page in the list.
     */
    public getDefault(): string {
        return this.pages[0].id;
    }

    /**
     * Constructs a hierarchical content structure from the provided data.
     *
     * This function processes the input data to create a structured result object
     * based on the hierarchy and contents of the data. Each item in the data is
     * examined for its children and contents, and the result object is populated
     * accordingly.
     *
     * @param data - The input data to be processed into a hierarchical structure.
     * @param options - An optional object containing additional configuration:
     *   @param options.key - A key to identify specific elements within the data.
     *
     * @returns An object representing the structured hierarchy of contents extracted
     * from the input data.
     */
    public contentMaker(data: any, options?: { key?: string }): any {
        if (!data) {
            return [];
        }

        let result: any = {};

        data = this.buildHierarchy(data, { simple: true, key: options?.key });

        data.forEach((f1: any) => {
            if (!f1?.children?.length && f1?.contents?.length) {
                result[f1.code] = {};

                f1.contents.forEach((f2: any) => {
                    result[f1.code][f2.code] = this.getData(f2);
                });
            } else if (f1?.children?.length && f1?.contents?.length) {
                result[f1.code] = [];
                f1.children.forEach((fc: any) => {
                    let elem: any = {};
                    fc.contents.forEach((f2: any) => {
                        elem[f2.code] = this.getData(f2);
                    });

                    result[f1.code].push(elem);
                });
            } else {
                result[f1.code] = this.getData(f1);
            }
        });
        return result;
    }

    /**
     * Helper function to extract data from a given content object.
     * @param data - The content object to be processed.
     * @returns The extracted data as a string.
     * @throws An error is thrown if the data object is not well-formed.
     */
    private getData(data: any) {
        try {
            switch (data.type) {
                case "input":
                case "text":
                case "textarea":
                case "editor":
                case "link":
                    return data.content;
                case "image":
                    try {
                        return {
                            orig: `${this.serverLink}api/media/${data.imageRef.name}.${data.imageRef.ex}`,
                            thumb: data.imageRef.thumbnail
                                ? `${this.serverLink}api/media/${data.imageRef.thumbnail}.${data.imageRef.ex}`
                                : `${this.serverLink}api/media/${data.imageRef.name}.${data.imageRef.ex}`,
                        };
                    } catch {
                        return "";
                    }
                case "video":
                    try {
                        return {
                            orig: `${this.serverLink}api/media/${data.imageRef.name}.${data.imageRef.ex}`,
                            thumb: `${this.serverLink}api/media/${data.imageRef.thumbnail}.png`,
                        };
                    } catch {
                        return "";
                    }
            }
        } catch (error) {
            console.error(error);
            return "";
        }
    }

    /**
     * Build a hierarchical structure of the given data.
     * @param data - The content objects to be processed.
     * @param options - Options for the hierarchy builder.
     * @param options.simple - If true, the hierarchy is built as a simple array of objects.
     * @param options.key - The name of the field to be used as the key for the hierarchy.
     * @returns The built hierarchy as an array of objects.
     * @throws An error is thrown if the data object is not well-formed.
     */
    public buildHierarchy(data: any[], options?: { simple?: boolean; key?: string }) {
        const map = new Map();

        if (!options?.simple) {
            if (data.length) {
                data.forEach((cd: any) => {
                    if (cd.media) {
                        cd.media.thumb = cd.media.thumbnail ? `${this.serverLink}api/media/${cd.media.thumbnail}.${cd.media.ex}` : cd.media.image;
                    }
                    if (cd.image) {
                        cd.imageRef.image = `${this.serverLink}api/media/${cd.imageRef.name}.${cd.imageRef.ex}`;
                        cd.imageRef.thumb = cd.imageRef.thumbnail ? `${this.serverLink}api/media/${cd.imageRef.thumbnail}.${cd.imageRef.ex}` : cd.imageRef.image;
                    }
                    if (cd.icon) {
                        cd.imageRef.image = `${this.serverLink}api/media/${cd.imageRef.name}.${cd.imageRef.ex}`;
                        cd.imageRef.thumb = cd.imageRef.thumbnail ? `${this.serverLink}api/media/${cd.imageRef.thumbnail}.${cd.imageRef.ex}` : cd.imageRef.image;
                    }
                });
            }
        }

        data.forEach((item) => {
            map.set(item.uid, { ...item, contents: [] });
        });

        let root: any[] = [];
        const keyName: string = options?.key ?? "children";
        const keyNameCopy: string = "children";

        /**
         * Add an item to the given parent object in the given key.
         * @param parent - The parent object.
         * @param item - The item to be added.
         * @param key - The key to add the item to.
         * @description
         * If the parent does not have a key with the given name or if it is not an array,
         * it will be created as an empty array.
         * If the item has a position, the array will be sorted by position.
         */
        function setItem(parent: any, item: any, key: string) {
            if (!Array.isArray(parent[key])) parent[key] = [];
            parent[key].push(map.get(item.uid));
            if (item.position) {
                parent[key].sort((a: any, b: any) => a.position - b.position);
            }
        }

        data.forEach((item) => {
            if (item.parent === null) {
                root.push(map.get(item.uid));
            } else {
                const parent = map.get(item.parent);
                if (parent) {
                    if (parent.type === "copy" && !parent.parent) {
                        if (item.type === "copy") {
                            setItem(parent, item, keyNameCopy);
                        } else {
                            setItem(parent, item, keyName);
                        }
                    } else {
                        setItem(parent, item, keyName);
                    }
                }
            }
        });

        return root;
    }
}
