/* Module imports */
import { Pipe, PipeTransform } from "@angular/core";

/* Project imports */
import { LangService } from "../services/lang.service";

@Pipe({
    name: "lang",
    pure: false,
    standalone: true,
})
export class LangPipe implements PipeTransform {
    constructor(private readonly langService: LangService) {}

    /**
     * Get localized text
     * @param code - uid code to search
     * @returns translated text
     */
    public transform(code: string, boolean?: boolean): string {
        try {
            return this.langService.get(code);
        } catch {
            if (boolean) {
                return "";
            }
            return code;
        }
    }
}
