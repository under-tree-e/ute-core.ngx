/* Module imports */
import { Inject, Injectable } from "@angular/core";
import { CookieService as NgxCookieService } from "ngx-cookie-service";
import { Preferences } from "@capacitor/preferences";
import { AES, enc, pad } from "crypto-ts";

/* Project imports */
import { UteEnvironment } from "../interfaces/environment";
import { DOCUMENT } from "@angular/common";

@Injectable({
    providedIn: "root",
})
export class CookieService {
    private cookiesExp: number = 30;
    private cookiesCode: string = "";
    private environment: UteEnvironment = {} as UteEnvironment;
    private readonly locationDom: Location;
    private readonly localStorageDom: Storage;

    constructor(@Inject(DOCUMENT) private readonly document: Document, private readonly cookieService: NgxCookieService) {
        this.locationDom = this.document.defaultView?.location!;
        this.localStorageDom = this.document.defaultView?.localStorage!;
    }

    /**
     * Init Cookie service
     * @param environment - Info about system
     * @param exp - Life time of cookies in days
     */
    public Init(environment: UteEnvironment, exp?: number) {
        if (!environment.production) {
            console.log(`${new Date().toISOString()} => CookieService`);
        }

        this.cookiesCode = this.locationDom.host.slice(0, 4).toUpperCase();
        if (exp) {
            this.cookiesExp = exp;
        }
        this.environment = environment;
    }

    /**
     * Set cookies OR localStorage
     *
     * @param name - display name {string}
     * @param data - data to save {any}
     * @param time - life time of cookies in days {number}
     *
     * @returns status
     */
    public set(name: string, data: any, time?: number) {
        try {
            if (typeof data != "string") {
                data = JSON.stringify(data);
            }
            data = this.encryption(data, true);

            if (this.environment.platform) {
                if (this.environment.platform === "android" || this.environment.platform === "ios") {
                    Preferences.set({
                        key: this.cookiesCode + name,
                        value: data,
                    });
                } else {
                    this.localStorageDom.setItem(this.cookiesCode + name, data);
                }
            } else {
                let expires = new Date();
                expires.setDate(expires.getDate() + (time ?? this.cookiesExp));
                let local = this.locationDom.host.split(":")[0];
                let secure = false;
                if (this.locationDom.protocol == "https:") {
                    secure = true;
                }

                this.cookieService.set(this.cookiesCode + name, data, expires, "/", local, secure);
            }

            return true;
        } catch (error: any) {
            console.error("set", error);
            return error;
        }
    }

    /**
     * Retrieves data associated with a given name from cookies or local storage.
     *
     * @param name - The display name used to retrieve the stored data.
     *
     * @returns The retrieved data, parsed and decrypted, or the error encountered.
     */
    public get(name: string) {
        let data: any = null;
        try {
            if (this.environment.platform) {
                if (this.environment.platform === "android" || this.environment.platform === "ios") {
                    data = Preferences.get({
                        key: this.cookiesCode + name,
                    });
                    data = data.value;
                } else {
                    data = this.localStorageDom.getItem(this.cookiesCode + name);
                }
            } else if (this.cookieService.get(this.cookiesCode + name) && this.cookieService.get(this.cookiesCode + name) != "undefined") {
                data = this.cookieService.get(this.cookiesCode + name);
            }

            if (data && typeof data === "string") {
                data = JSON.parse(this.encryption(data));
            }

            return data;
        } catch (error: any) {
            console.error("get", error);
            return error;
        }
    }

    /**
     * Removes specified data associated with a given name from cookies or local storage.
     * If no name is provided, clears all stored data.
     *
     * @param name - The display name used to identify the stored data to be removed.
     *
     * @returns True if the operation is successful, or the error encountered.
     */
    public remove(name: string) {
        try {
            if (this.environment.platform) {
                if (this.environment.platform === "android" || this.environment.platform === "ios") {
                    if (name) {
                        Preferences.remove({
                            key: this.cookiesCode + name,
                        });
                    } else {
                        Preferences.clear();
                    }
                } else if (name) {
                    this.localStorageDom.removeItem(this.cookiesCode + name);
                } else {
                    this.localStorageDom.clear();
                }
            } else if (name) {
                this.cookieService.delete(this.cookiesCode + name, "/");
            } else {
                let local = this.locationDom.host.split(":")[0];
                let secure = false;
                if (this.locationDom.protocol == "https:") {
                    secure = true;
                }
                this.cookieService.deleteAll("/", local, secure);
            }
            return true;
        } catch (error) {
            console.error("remove", error);
            return error;
        }
    }

    /**
     * Encrypts or decrypts data using AES algorithm.
     *
     * @param data The string data to be encrypted or decrypted.
     * @param encrypt If true, encrypt the data; otherwise decrypt the data.
     *
     * @returns The encrypted or decrypted string.
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
