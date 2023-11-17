import { Inject, Injectable } from "@angular/core";
import { UteModuleConfigs } from "../interfaces/config";
import { ResizeService } from "./resize.service";

@Injectable({
    providedIn: "root",
})
export class CoreService {
    constructor(@Inject("config") private config: UteModuleConfigs, private resizeService: ResizeService) {
        console.log(config);

        // if (this.config && this.config.resizer) {
        //     this.resizeService.Init(this.config.customFontSizes || undefined);
        // }

        this.resizeService.Init();
    }
}
// @Injectable()
// export class CoreService {
//     constructor(@Inject("config") private config: UteModuleConfigs) {
//         console.log(this.config);
//     }
// }
