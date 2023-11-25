import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "uteInt",
})
export class StringIntegerPipe implements PipeTransform {
    /**
     *
     * @param value
     * @returns
     */
    public transform(value: string): number {
        try {
            return parseInt(value);
        } catch {
            return 0;
        }
    }
}
