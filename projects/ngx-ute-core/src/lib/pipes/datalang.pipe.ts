import { Pipe, PipeTransform } from "@angular/core";
import { LangService } from "../services/lang.service";

@Pipe({
    name: "datalang",
    pure: false,
    standalone: true,
})
export class DataLangPipe implements PipeTransform {
    constructor(private langService: LangService) {}

    /**
     * Try to find a string in a template with a current locale and replace it, if not found try to replace with default locale
     *
     * @param text - a string to check
     *
     * @returns a string with found value or a original string if not found
     */
    public transform(text: any): string {
        try {
            if (typeof text === "string") {
                const locale: string = this.langService.current();

                const defLocale: string = this.langService.default();

                const pattern: any = new RegExp(`\\[${locale}\\](.*?)(?=\\[|$)`, "g");
                const match: string = pattern.exec(text);

                if (!match) {
                    const patternAlt: any = new RegExp(`\\[${defLocale}\\](.*?)(?=\\[|$)`, "g");
                    const matchAlt: string = patternAlt.exec(text);

                    return matchAlt[1] ?? (text as string);
                } else {
                    return match[1] ?? (text as string);
                }
            } else {
                throw false;
            }
        } catch {
            return text as string;
        }
    }
}
