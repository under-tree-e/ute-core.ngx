import { Pipe, PipeTransform } from "@angular/core";
import { LangService } from "../services/lang.service";

@Pipe({
    name: "lang",
    pure: false,
    // standalone: true,
})
export class LangPipe implements PipeTransform {
    constructor(private langService: LangService) {}
    /**
     *
     * @param value
     * @returns
     */
    public transform(value: string): string {
        try {
            return this.langService.get(value);
        } catch {
            return value;
        }
    }
}
