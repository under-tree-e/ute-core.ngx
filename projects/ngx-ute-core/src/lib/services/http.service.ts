/* Module imports */
import { Inject, Injectable, Optional } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { lastValueFrom } from "rxjs";

/* Project imports */
import { UteEnvironment } from "../interfaces/environment";
import { APP_BASE_HREF, DOCUMENT } from "@angular/common";
import { UteObjects } from "../interfaces/object";
import { UteApis } from "../interfaces/api";
import { CustomHeaderData, HttpOptions } from "../interfaces/http-opt";
import { ApiConst } from "../constantes/api";

@Injectable({
    providedIn: "root",
})
export class HttpService {
    private environment: UteEnvironment = {} as UteEnvironment;
    private options: {
        body?: any;
        headers?: HttpHeaders;
    } = {};
    private readonly apiPath: string = "api";
    private readonly apiSubDomain: string = "";
    private serverTimer: any = null;
    private readonly locationDom: Location;

    /**
     * Constructs an instance of the HttpService class.
     *
     * @param http - The HttpClient service used for making HTTP requests.
     * @param baseHref - The optional base href for constructing URLs, injected from the app's base href.
     * @param document - The Document object, used to access the window's location.
     */
    constructor(private readonly http: HttpClient, @Inject(APP_BASE_HREF) @Optional() private readonly baseHref: string, @Inject(DOCUMENT) private readonly document: Document) {
        this.locationDom = this.document.defaultView?.location!;
    }

    /**
     * Initializes the HttpService.
     *
     * @param environment - The environment settings for the app.
     *
     * Initializes the HttpService with the environment settings and sets up the headers
     * with the session data.
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
                Session: btoa(
                    JSON.stringify({
                        appId: this.environment.appId ?? "---",
                        deviceId: deviceId,
                        device: this.environment.platform,
                        date: new Date().toISOString().split("T")[0],
                    })
                ),
            }),
        };
    }

    /**
     * Creates a full URL for the HTTP request.
     * @param option - Options for HTTP request.
     * @returns Full URL for the HTTP request.
     *
     * This function takes into account the following options:
     * - `online` - If true, the request will be made to the online server.
     * - `global` - If true, the request will be made to the global server.
     * - `headers` - Custom headers to be added to the request.
     *
     * If no options are provided, the request will be made to the app server.
     */
    public httpAddress(option?: HttpOptions): string {
        if (!option?.multipart) {
            this.options.headers = this.options.headers?.set("Content-Type", `application/json`);
        } else if (this.options.headers) {
            this.options.headers = this.options.headers.delete("Content-Type");
        }

        if (this.environment.session?.authToken) {
            this.options.headers = this.options.headers?.set("Authorization", `Bearer ${this.environment.session?.authToken}`);
        }

        if (this.environment.apiToken && !this.options.headers?.has("x-api-key")) {
            this.options.headers = this.options.headers?.set("x-api-key", `Bearer ${this.environment.apiToken}`);
        }

        option?.headers?.forEach((h: CustomHeaderData) => {
            let name: string = Object.keys(h)[0];
            let value: string = Object.values(h)[0];
            this.options.headers = this.options.headers?.set(name, value);
        });

        let link: string = "";

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
     * Performs an HTTP GET request to the specified local path.
     *
     * @param path - The local URL path from which to fetch data.
     * @returns A promise resolving to the response data of type `T`.
     *
     * This method uses the HttpClient to perform a GET request to the provided path.
     * It converts the response to a promise and resolves it with the response data.
     * If an error occurs, the promise is rejected with the error.
     */
    public httpLocal<T>(path: string): Promise<T> {
        return new Promise((resolve, reject) => {
            lastValueFrom(this.http.get<T>(path))
                .then((response: any) => {
                    resolve(response);
                })
                .catch((error: Error) => {
                    reject(error);
                });
        });
    }

    /**
     * Performs an HTTP request to the specified local path.
     *
     * @param sqlMethod - The HTTP method to use for the request.
     * @param json - The JSON data to be sent with the request.
     * @param httpOptions - Options for the request.
     * @returns A promise resolving to the response data of type `T`.
     *
     * This method uses the HttpClient to perform the specified HTTP request to the provided path.
     * It converts the response to a promise and resolves it with the response data.
     * If an error occurs, the promise is rejected with the error.
     */
    public httpRequest<T>(sqlMethod: string, json: UteApis<T>[], httpOptions?: HttpOptions): Promise<UteObjects<T>> {
        return new Promise((resolve, reject) => {
            (async () => {
                let response: any = {};
                let reqMethod: string = "http";
                try {
                    sqlMethod = sqlMethod.toUpperCase();

                    const format = this.formatMethod<T>(json, reqMethod);
                    const jsonConvert: UteObjects = format.convert;
                    reqMethod = format.method;

                    if (typeof jsonConvert === "string") {
                        reject(new Error(jsonConvert));
                        return;
                    }

                    if (reqMethod === "online") {
                        clearInterval(this.serverTimer);
                        this.serverTimer = null;
                    }

                    if (!this.environment.storage || httpOptions?.online || httpOptions?.global) {
                        let rp: any = {
                            u: `${this.httpAddress(httpOptions)}${reqMethod}`,
                            b: httpOptions?.multipart ? jsonConvert["body"][0] : jsonConvert["body"],
                            o: { ...this.options },
                        };

                        let httpMethod: any = this.generateRequest(sqlMethod, jsonConvert, reqMethod, rp, httpOptions, json);

                        response = await lastValueFrom(httpMethod);
                    } else if (this.environment.storage) {
                        if (reqMethod === "http") {
                            response = await this.environment.storage.request(sqlMethod, jsonConvert["body"], httpOptions?.db);
                        } else {
                            throw new Error("405 Method Not Allowed");
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
                        reject(error as Error);
                    }
                }
            })();
        });
    }

    /**
     * Converts a request to the standard format that can be used for sending an HTTP request.
     *
     * This method takes a request object and a request method as an argument and returns a converted request object
     * with the standard format that can be used for sending an HTTP request.
     *
     * The request object may contain either a single request or multiple requests.
     * If the request object contains a single request, the method will convert the request to the standard format
     * and return the converted request object.
     * If the request object contains multiple requests, the method will return an error message.
     *
     * @param json - The request object
     * @param reqMethod - The request method
     * @returns A converted request object with the standard format that can be used for sending an HTTP request.
     *          If the request object contains multiple requests, the method will return an error message.
     */
    private formatMethod<T>(json: any, reqMethod: string): any {
        let jsonConvert: UteObjects = { body: [] };
        let jsonMethods: UteApis<T>[] = json.filter((js: UteApis<T>) => js.method);

        if (jsonMethods.length > 0) {
            if (jsonMethods.length > 1) {
                return "Http request not supported multiple Methods";
            }
            reqMethod = jsonMethods[0].method as string;
            jsonConvert["body"] = [jsonMethods[0].select];
        } else {
            jsonConvert["body"] = json.map((rq: any) => {
                let newObject = Object.entries(rq).map(([key, value]) => {
                    let newKey: string = key;
                    Object.keys(ApiConst).forEach((apiKey: string, i: number) => {
                        if (apiKey === key) {
                            newKey = Object.values(ApiConst)[i];
                        }
                    });
                    return [newKey, value];
                });
                return Object.fromEntries(newObject);
            });
        }
        return { convert: jsonConvert, method: reqMethod };
    }

    /**
     * Generates an HTTP request based on the provided method, request body, and options.
     *
     * This method takes a request method, a request body, and options as arguments and returns an HTTP request object.
     * The request object can be used to send an HTTP request to the server.
     *
     * @param sqlMethod - The HTTP method to use for the request.
     * @param jsonConvert - The request body.
     * @param reqMethod - The request method.
     * @param rp - The request parameters.
     * @param httpOptions - The HTTP options.
     * @param json - The request body.
     * @returns An HTTP request object.
     */
    private generateRequest<T>(sqlMethod: string, jsonConvert: UteObjects, reqMethod: string, rp: any, httpOptions?: HttpOptions, json?: any): any {
        let httpMethod: any = null;

        function g() {
            const s = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            return s.charAt(Math.floor(Math.random() * s.length));
        }

        function a(o: string) {
            return g() + g() + o + g() + g();
        }

        function b(o: string) {
            return btoa(encodeURIComponent(JSON.stringify(o)));
        }

        let jsonString = "";

        switch (sqlMethod) {
            case "GET":
                jsonString = b(jsonConvert["body"]);
                jsonString = jsonString.replaceAll("=", "");
                jsonString = a(jsonString);
                jsonString = `body=${jsonString}`;

                if (jsonString.length > 5000) {
                    throw new Error("GET request too long!");
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
                delete rp.o.body;
                break;
        }
        return httpMethod;
    }

    /**
     * Checks the online status of the application by sending a POST request.
     *
     * @returns A promise that resolves to `true` if the application is online, otherwise `false`.
     *
     * This method attempts to verify the application's online status by performing a POST request
     * with the method "online". If the request is successful, it updates the environment's online
     * status to true and resolves the promise with `true`. If the request fails, it resolves the
     * promise with `false`.
     */
    public checkOnline(): Promise<boolean> {
        return new Promise((resolve) => {
            (async () => {
                try {
                    await this.httpRequest("POST", [{ method: "online" }]);
                    this.environment.online = true;
                    resolve(true);
                } catch {
                    resolve(false);
                }
            })();
        });
    }
}
