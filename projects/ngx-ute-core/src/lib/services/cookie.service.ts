import { Injectable } from "@angular/core";
import { CookieService as NgxCookieService } from "ngx-cookie-service";
import { Preferences } from "@capacitor/preferences";
import { AES, enc, pad } from "crypto-ts";
import { UteEnvironment } from "../interfaces/environment";

@Injectable({
    providedIn: "root",
})
export class CookieService {
    private cookiesExp: number = 30;
    private cookiesCode: string = location.host.slice(0, 4).toUpperCase();
    private environment: UteEnvironment = {} as UteEnvironment;

    constructor(private cookieService: NgxCookieService) {}

    /**
     *
     * @param environment
     * @param exp
     */
    public Init(environment: UteEnvironment, exp?: number) {
        console.log("CookieService - Init");
        // console.log(`${new Date().toISOString()} => CookieService`);

        if (exp) {
            this.cookiesExp = exp;
        }
        this.environment = environment;
    }

    /**
     * Set cookies OR localStorage
     * @param name - display name {string}
     * @param data - data to save {Object}
     * @param time - custom expires time {number}
     * @returns boolean or error
     */
    public set(name: string, data: any, time?: number): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                if (typeof data != "string") {
                    data = JSON.stringify(data);
                }
                data = this.encryption(data, true);

                if (this.environment.platform) {
                    if (this.environment.platform === ("android" || "ios")) {
                        await Preferences.set({
                            key: this.cookiesCode + name,
                            value: data,
                        });
                    } else {
                        localStorage.setItem(this.cookiesCode + name, data);
                    }
                } else {
                    let expires = new Date();
                    expires.setDate(expires.getDate() + (time ? time : this.cookiesExp));
                    let local = location.host.split(":")[0];
                    let secure = false;
                    if (location.protocol == "https:") {
                        secure = true;
                    }

                    await this.cookieService.set(this.cookiesCode + name, data, expires, "/", local, secure);
                }

                resolve(true);
            } catch (error: any) {
                console.error("set", error);
                reject(error);
            }
        });
    }

    /**
     *
     * @param name
     * @returns
     */
    public get(name: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let data: any = null;
            try {
                if (this.environment.platform) {
                    if (this.environment.platform === ("android" || "ios")) {
                        data = await Preferences.get({
                            key: this.cookiesCode + name,
                        });
                    } else {
                        data = localStorage.getItem(this.cookiesCode + name);
                    }
                } else {
                    if ((await this.cookieService.get(this.cookiesCode + name)) && (await this.cookieService.get(this.cookiesCode + name)) != "undefined") {
                        data = await this.cookieService.get(this.cookiesCode + name);
                    }
                }

                if (data && typeof data === "string") {
                    data = JSON.parse(this.encryption(data));
                }
                resolve(data);
            } catch (error: any) {
                console.error("get", error);
                reject(error);
            }
        });
    }

    /**
     *
     * @param name
     * @returns
     */
    public remove(name: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                if (this.environment.platform) {
                    if (this.environment.platform === ("android" || "ios")) {
                        if (name) {
                            await Preferences.remove({
                                key: this.cookiesCode + name,
                            });
                        } else {
                            await Preferences.clear();
                        }
                    } else {
                        if (name) {
                            localStorage.removeItem(this.cookiesCode + name);
                        } else {
                            localStorage.clear();
                        }
                    }
                } else {
                    if (name) {
                        await this.cookieService.delete(this.cookiesCode + name, "/");
                        resolve(true);
                    } else {
                        let local = location.host.split(":")[0];
                        let secure = false;
                        if (location.protocol == "https:") {
                            secure = true;
                        }
                        await this.cookieService.deleteAll("/", local, secure);
                        resolve(true);
                    }
                }
            } catch (error) {
                console.error("remove", error);
                reject(error);
            }
        });
    }

    /**
     * Encryption
     * @param data
     * @param encrypt
     * @returns
     */
    private encryption(data: string, encrypt: boolean = false): string {
        let key = enc.Hex.parse("0123456789abcdef0123456789abcdef");
        let iv = enc.Hex.parse("abcdef9876543210abcdef9876543210");

        try {
            let result: string = "";

            if (encrypt) {
                result = AES.encrypt(data, key, { iv: iv, padding: pad.PKCS7 }).toString();
            } else {
                result = AES.decrypt(data, key, { iv: iv, padding: pad.PKCS7 }).toString(enc.Utf8);
            }

            return result;
        } catch (error: any) {
            console.error("encryption", error);
            return "";
        }
    }
}
