import { Inject, Injectable, Optional } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { UteEnvironment } from "../interfaces/environment";
import { APP_BASE_HREF, DOCUMENT } from "@angular/common";
import { lastValueFrom } from "rxjs";
import { UteObjects } from "../interfaces/object";
import { UteApis } from "../interfaces/api";
import { CustomHeaderData, HttpOptions } from "../interfaces/http-opt";
import * as qs from "qs";
import { ApiConst } from "../constantes/api";

@Injectable({
    providedIn: "root",
})
export class HttpService {
    private environment: UteEnvironment = {} as UteEnvironment;
    private options: {
        body?: any;
        headers?: HttpHeaders | undefined;
    } = {};
    private apiPath: string = "api";
    private apiSubDomain: string = "";
    private serverTimer: any = null;
    private locationDom: Location;

    constructor(private http: HttpClient, @Inject(APP_BASE_HREF) @Optional() private baseHref: string, @Inject(DOCUMENT) private document: Document) {
        this.locationDom = this.document.defaultView?.location!;
    }

    /**
     *
     * @param environment
     */
    public async Init(environment: UteEnvironment) {
        if (!environment.production) {
            console.log(`${new Date().toISOString()} => HttpService`);
        }

        this.environment = environment;
        let deviceId: string = "";
        try {
            deviceId = await this.httpLocal("assets/deviceId");
        } catch {}
        this.options = {
            headers: new HttpHeaders({
                "Content-Type": "application/json",
                Session: btoa(
                    JSON.stringify({
                        appId: this.environment.appId || "---",
                        deviceId: deviceId,
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
    public httpAddress(option?: HttpOptions): string {
        if (this.environment.session?.authToken) {
            this.options.headers = this.options.headers?.set("Authorization", `Bearer ${this.environment.session?.authToken}`);
        }

        if (this.environment.apiToken && !this.options.headers?.has("x-api-key")) {
            this.options.headers = this.options.headers?.set("x-api-key", `Bearer ${this.environment.apiToken}`);
        }

        if (option && option.headers) {
            option.headers.map((h: CustomHeaderData) => {
                let name: string = Object.keys(h)[0];
                let value: string = Object.values(h)[0];
                this.options.headers = this.options.headers?.set(name, value);
            });
        }

        let link: string = `http://localhost:8080`;

        if ((option?.online && this.environment.appServer) || (!option?.global && this.environment.appServer) || (this.environment.ssr && this.environment.appServer)) {
            link = this.environment.appServer;
        } else if (option?.global && this.environment.globalServer) {
            link = this.environment.globalServer;
        } else {
            link = `${this.locationDom.protocol}//${this.locationDom.host}${this.baseHref}`;
        }

        if (this.apiSubDomain) link = link.replace("://", `://${this.apiSubDomain}`);
        if (!link.endsWith("/")) link += "/";
        if (this.apiPath) link += `${this.apiPath}/`;

        return link;
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
            let reqMethod: string = "http";
            try {
                sqlMethod = sqlMethod.toUpperCase();

                // Declare base parameters
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

                if (reqMethod === "online") {
                    clearInterval(this.serverTimer);
                    this.serverTimer = null;
                }

                if (!this.environment.storage || httpOptions?.online || httpOptions?.global) {
                    let rp: any = {
                        u: `${this.httpAddress(httpOptions)}${reqMethod}`,
                        b: jsonConvert["body"],
                        o: { ...this.options },
                    };

                    // Convert method to function
                    let httpMethod: any = null;
                    switch (sqlMethod) {
                        case "GET":
                            function g() {
                                const s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                                return s.charAt(Math.floor(Math.random() * s.length));
                            }
                            function a(o: string) {
                                return g() + g() + o + g() + g();
                            }

                            let jsonString = btoa(encodeURIComponent(JSON.stringify(jsonConvert["body"])));
                            jsonString = jsonString.replaceAll("=", "");
                            jsonString = a(jsonString);
                            jsonString = `body=${jsonString}`;

                            if (jsonString.length > 5000) {
                                throw "GET request too long!";
                            }

                            httpMethod = this.http.get<T>(`${this.httpAddress(httpOptions)}${reqMethod}${jsonString ? "?" + jsonString : ""}`, this.options);

                            break;
                        case "POST":
                            httpMethod = this.http.post<T>(rp.u, rp.b, rp.o);
                            break;
                        case "PUT":
                            httpMethod = this.http.put<T>(rp.u, rp.b, rp.o);
                            break;
                        case "DELETE":
                            rp.o.body = JSON.stringify(json);
                            httpMethod = this.http.delete<T>(rp.u, rp.o);
                            // delete rp.o.body;
                            break;
                    }

                    // Send request
                    response = await lastValueFrom(httpMethod);
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
                if (reqMethod === "online") {
                    this.environment.online = false;
                    this.serverTimer = setInterval(() => {
                        this.checkOnline();
                    }, 300 * 1000);
                    resolve({ online: false } as any);
                } else {
                    reject(error);
                }
            }
        });
    }

    /**
     * Update server online status
     */
    public checkOnline(): Promise<boolean> {
        return new Promise(async (resolve) => {
            try {
                await this.httpRequest("POST", [{ method: "online" }]);
                this.environment.online = true;
                resolve(true);
            } catch {
                resolve(false);
            }
        });
    }
}
