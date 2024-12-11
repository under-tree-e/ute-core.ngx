import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import { HttpService } from "./http.service";
import { UteApis } from "../interfaces/api";

@Injectable({
    providedIn: "root",
})
export class ResolveService {
    constructor(private httpService: HttpService) {}

    public resolve(route: ActivatedRouteSnapshot): Promise<any> {
        let page: string = route.queryParams["page"];

        if (page !== undefined) {
            return new Promise(async (resolve, reject) => {
                if (!page) {
                    page = "home";
                }

                try {
                    const result: any = await this.httpService.httpRequest("GET", [
                        {
                            table: (route.data as any).table || "pages",
                            where: {
                                template: page,
                            },
                            refs: true,
                        },
                    ]);
                    try {
                        resolve(result[(route.data as any).table || "pages"][0]);
                    } catch {
                        resolve(false);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        } else {
            let table: string = route.url[route.url.length - 2].path;
            if (route.data && (route.data as any).path) table = (route.data as any).path;
            let id: any = route.params["id"];
            if (route.params["item"]) {
                id = route.params["item"];
            }
            let uuid: boolean = false;
            if (id.includes("-")) {
                uuid = true;
            } else {
                id = parseInt(id);
            }

            return new Promise(async (resolve, reject) => {
                if (id === 0) {
                    resolve(false);
                } else {
                    try {
                        let jsons: UteApis<any>[] = [
                            {
                                table: (route.data as any).table ? (route.data as any).table : table,
                                where: {
                                    [uuid ? "uuid" : "id"]: id,
                                },
                            },
                        ];

                        if ((route.data as any).refs) {
                            jsons[0].refs = true;
                        }

                        if ((route.data as any).noref) {
                            jsons[0].noref = true;
                        }

                        if ((route.data as any).jsons) {
                            jsons = [...jsons, ...(route.data as any).jsons];
                        }

                        const result: any = await this.httpService.httpRequest("GET", jsons);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        }
    }
}
