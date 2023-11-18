import { Inject, Injectable } from "@angular/core";
import { UteModuleConfigs } from "@ute/core/interfaces/config";
import { ResizeService } from "@ute/core/services/resize.service";

@Injectable({
    providedIn: "root",
})
export class CoreService {
    constructor(@Inject("config") private config: UteModuleConfigs, private resizeService: ResizeService) {
        console.log("CoreService");

        if (this.config && this.config.resizer) {
            this.resizeService.Init(this.config.customFontSizes || undefined);
        }
    }
}
