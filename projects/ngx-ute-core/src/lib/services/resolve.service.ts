/* Module imports */
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";

/* Project imports */
import { HttpService } from "./http.service";
import { UteApis } from "../interfaces/api";
import { ErrorsData, UteObjects } from "../interfaces/object";
import { SEOService } from "./seo.service";

@Injectable({
    providedIn: "root",
})
export class ResolveService {
    constructor(private readonly httpService: HttpService, private readonly seoService: SEOService) {}

    /**
     * Resolve data based on route configuration.
     *
     * @param route - The activated route snapshot containing route information.
     *
     * @returns A promise resolving to the requested data or false if not found.
     */
    public resolve(route: ActivatedRouteSnapshot): Promise<any> {
        let jsons: UteApis<any>[] = [];
        const data: any = route.data;

        return new Promise((resolve, reject) => {
            (async () => {
                const table: string = this.getTable(route.url, data);
                const id: UteObjects | null = this.getId(route.params);

                jsons = this.buildObject(data, table, id, route);

                try {
                    const result: any = await this.httpService.httpRequest("GET", jsons);

                    if (data["seo"]) {
                        const page: any = result.page[0];
                        if (page) {
                            this.seoService.title = page[route.data["seo"]["title"] ?? "seoTitle"] ?? "";
                            this.seoService.desk = page[route.data["seo"]["desk"] ?? "seoDesk"] ?? "";
                            this.seoService.keys = page[route.data["seo"]["keys"] ?? "seoKeywords"] ?? "";
                        }
                    }

                    resolve(result);
                } catch (error: any) {
                    reject(error as ErrorsData);
                }
            })();
        });
    }
    // }

    /**
     * Extracts table name from route URL.
     *
     * @param url - Route URL parts.
     * @param data - Route data.
     *
     * @returns Table name.
     */
    private getTable(url: any[], data: any): string {
        let table: string =
            url.length > 1
                ? url
                      .map((u) => u.path)
                      .slice(0, -1)
                      .join("/")
                : url[0]?.path ?? "";
        table = table.split("?")[0].split("#")[0];

        return data?.path ?? table;
    }

    /**
     * Extracts id from route parameters.
     *
     * @param params - Route parameters object.
     *
     * @returns Id object or null.
     */
    private getId(params: any): UteObjects | null {
        let id: any = params["id"];
        if (params["item"]) {
            id = params["item"];
        }

        let uuid: boolean = false;
        if (id) {
            if (id.includes("-")) {
                uuid = true;
            } else {
                id = parseInt(id);
            }

            return { [uuid ? "uuid" : "id"]: id };
        }
        return null;
    }

    /**
     * Constructs an API object for a query.
     *
     * @param data - Route data containing table and reference information.
     * @param table - Default table name if not provided in data.
     * @param id - Object representing the ID condition for the query.
     *
     * @returns An UteApis object configured with table, where, refs, and noref properties.
     */
    private buildObject(data: any, table: string, id: UteObjects | null, route: ActivatedRouteSnapshot): UteApis<any>[] {
        let api: UteApis<any> = {};

        if (!route.data["custom"]) {
            if (data.table || table) {
                api.table = data.table ?? table;
            }

            if (id) {
                api.where = id;
            }

            if (data.refs) {
                api.refs = true;
            }

            if (data.noref) {
                api.noref = true;
            }
        }

        let apiArray: UteApis<any>[] = [];

        if (data.jsons) {
            apiArray = data.jsons.map((j: UteApis<any>) => {
                const original = api.table === j.table && (api.as ? api.as === j.as : !j.as);

                if (j.as === "page") {
                    j.where = {
                        code: route.url.length ? route.url.join("/") : "home",
                    };
                }

                if (!original) {
                    return j;
                }
                return null;
            });

            apiArray = apiArray.filter((a) => a !== null);
        }

        if (api.table) apiArray.push(api);

        return apiArray;
    }
}
