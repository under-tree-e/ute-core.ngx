import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { UteEnvironment } from "../interfaces/environment";
import { PlatformLocation } from "@angular/common";
import { lastValueFrom } from "rxjs";
import { UteObjects } from "../interfaces/object";
import { UteApis } from "../interfaces/api";
import { HttpOptions } from "../interfaces/http-opt";
import * as qs from "qs";
import { ApiConst } from "../contantes/api";
import { OnlineStatusService } from "ngx-online-status";

@Injectable({
    providedIn: "root",
})
export class HttpService {
    private environment: UteEnvironment = {} as UteEnvironment;
    private options: {
        body?: any;
        headers?: HttpHeaders | undefined;
    } = {};

    constructor(private http: HttpClient, private platformLocation: PlatformLocation, private onlineStatusService: OnlineStatusService) {}

    /**
     *
     * @param environment
     */
    public async Init(environment: UteEnvironment) {
        console.log("HttpService - Init");
        // console.log(`${new Date().toISOString()} => HttpService`);

        this.environment = environment;
        this.options = {
            headers: new HttpHeaders({
                "Content-Type": "application/json",
                Session: btoa(
                    JSON.stringify({
                        deviceId: await this.httpLocal("assets/.deviceId"),
                        device: this.environment.platform,
                        date: new Date().toISOString().split("T")[0],
                    })
                ),
            }),
        };
    }

    /**
     *
     * @returns
     */
    private httpAddress(): string {
        if (this.environment.authToken && !this.options.headers?.has("Authorization")) {
            this.options.headers = this.options.headers?.set("Authorization", `Bearer ${this.environment.authToken}`);
        }

        if (this.environment.apiToken && !this.options.headers?.has("Token")) {
            this.options.headers = this.options.headers?.set("Token", `Bearer ${this.environment.authToken}`);
        }

        let link: string = "http://localhost:8080";
        switch (this.environment.platform) {
            case "web":
                if (this.environment.production) {
                    link = `${location.protocol}//${location.host}${this.platformLocation.getBaseHrefFromDOM()}`;
                } else {
                    this.environment.server ? (link = this.environment.server) : null;
                }
                break;
            default:
                this.environment.server ? (link = this.environment.server) : null;
                break;
        }
        return `${link}${link.endsWith("/") ? "api/" : "/api/"}`;
    }

    /**
     * Get data from local files
     * @param path - path to file
     * @returns data from file OR error
     */
    public httpLocal<T>(path: string): Promise<T> {
        return new Promise((resolve, reject) => {
            lastValueFrom(this.http.get<T>(path))
                .then((response: any) => {
                    resolve(response);
                })
                .catch((error: any) => {
                    reject(error);
                });
        });
    }

    /**
     * Send request to server of local db
     * @param sqlMethod - SQL method `('GET', 'POST', 'PUT', 'DELETE'...)`
     * @param json - request body
     * @param httpOptions - additional option as *`custom DB (only local)`*, *`Auth token`* and *`local storage service`*
     * @returns
     */
    public httpRequest<T>(sqlMethod: string, json: UteApis<T>[], httpOptions?: HttpOptions): Promise<UteObjects<T>> {
        return new Promise(async (resolve, reject) => {
            let response: any = {};
            try {
                sqlMethod = sqlMethod.toUpperCase();

                // Check if Internet isset
                this.environment.online = this.onlineStatusService.getStatus() == 1 ? true : false;

                // Declare base parameters
                let reqMethod: string = "http";
                let jsonConvert: UteObjects = { body: [] };
                let jsonMethods: UteApis<T>[] = json.filter((js: UteApis<T>) => js.method);

                // Check if only one method and not default
                if (jsonMethods.length > 0) {
                    if (jsonMethods.length > 1) {
                        reject("Http request not supported multiple Methods");
                        return;
                    }
                    reqMethod = jsonMethods[0].method as string;
                    jsonConvert["body"] = [jsonMethods[0].select];
                } else {
                    jsonConvert["body"] = json.map((rq: any) => {
                        let newObject = Object.entries(rq).map(([key, value]) => {
                            let newKey: string = key;
                            Object.keys(ApiConst).map((apiKey: string, i: number) => {
                                if (apiKey === key) {
                                    newKey = Object.values(ApiConst)[i];
                                }
                            });
                            return [newKey, value];
                        });
                        return Object.fromEntries(newObject);
                    });
                }

                if (!this.environment.storage || httpOptions?.online) {
                    if (this.environment.online) {
                        let rp: any = {
                            u: `${this.httpAddress()}${reqMethod}`,
                            // b: reqMethod === "http" ? jsonConvert : (json as UteApis<any>).select,
                            b: jsonConvert["body"],
                            o: this.options,
                        };

                        // Convert method to function
                        let httpMethod: any = this.http.get<T>(rp.u, rp.o);
                        switch (sqlMethod) {
                            case "GET":
                                let jsonString = qs.stringify(jsonConvert);
                                httpMethod = this.http.get<T>(`${this.httpAddress()}${reqMethod}${jsonString ? "?" + jsonString : ""}`, this.options);
                                break;
                            case "POST":
                                httpMethod = this.http.post<T>(rp.u, rp.b, rp.o);
                                break;
                            case "PUT":
                                httpMethod = this.http.put<T>(rp.u, rp.b, rp.o);
                                break;
                            case "DELETE":
                                (this.options.body = JSON.stringify(json)), (httpMethod = this.http.delete<T>(rp.u, rp.o));
                                break;
                        }

                        // Send request
                        response = await lastValueFrom(httpMethod);
                        // console.log(response);
                    } else {
                        throw "502 Bad Gateway - No internet connection";
                    }
                } else if (this.environment.storage) {
                    if (reqMethod === "http") {
                        // Send request
                        response = await this.environment.storage.request(sqlMethod, (jsonConvert as UteObjects)["body"], httpOptions?.db);
                    } else {
                        throw "405 Method Not Allowed";
                    }
                }
                resolve(response);
            } catch (error) {
                reject(error);
            }
        });
    }
}
