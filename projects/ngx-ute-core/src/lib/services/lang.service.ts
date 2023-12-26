import { Injectable } from "@angular/core";
import { UteEnvironment } from "../interfaces/environment";

@Injectable({
    providedIn: "root",
})
export class LangService {
    constructor() {}

    /**
     * Initialization module
     */
    public Init(environment: UteEnvironment) {
        console.log("LangService - Init");
        // console.log(`${new Date().toISOString()} => LangService`);
    }
}
