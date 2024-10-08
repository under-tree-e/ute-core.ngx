import { Pipe, PipeTransform } from "@angular/core";
import { LangService } from "../services/lang.service";

@Pipe({
    name: "lang",
    pure: false,
    standalone: true,
})
export class LangPipe implements PipeTransform {
    constructor(private langService: LangService) {}
    /**
     * Get localized text
     * @param code - uid code to search
     * @returns translated text
     */
    public transform(code: string): string {
        try {
            return this.langService.get(code);
        } catch {
            return code;
        }
    }
}
