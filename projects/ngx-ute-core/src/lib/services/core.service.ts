import { Inject, Injectable } from "@angular/core";
import { UteCoreConfigs } from "../interfaces/config";
import { ResizeService } from "./resize.service";

@Injectable({
    providedIn: "root",
})
export class CoreService {
    constructor(@Inject("UteCoreConfig") private config: UteCoreConfigs, private resizeService: ResizeService) {
        console.log(`${new Date().toISOString()} => CoreService`);
        // console.log("CoreService");

        if (this.config && this.config.resizer) {
            this.resizeService.Init(this.config.customFontSizes || undefined);
        }
    }
}
