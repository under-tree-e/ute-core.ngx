import { inject, Pipe, PipeTransform } from "@angular/core";
import { LangService } from "../services/lang.service";

@Pipe({
    name: "lang",
    pure: false,
    standalone: true,
})
export class LangPipe implements PipeTransform {
    // private langService: LangService = inject(LangService);
    constructor(private langService: LangService) {
        // constructor() {
        console.log(104);
    }
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
