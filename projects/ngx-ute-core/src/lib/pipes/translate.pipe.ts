import { Pipe, PipeTransform } from "@angular/core";
import { LangService } from "../services/lang.service";

@Pipe({
    name: "lang",
})
export class TranslatePipe implements PipeTransform {
    constructor(private langService: LangService) {}
    /**
     *
     * @param value
     * @returns
     */
    public transform(value: string): string {
        try {
            return this.langService.getLangSync(value);
        } catch {
            return value;
        }
    }
}
