import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "uteFloat",
})
export class StringFloatPipe implements PipeTransform {
    /**
     *
     * @param value
     * @returns
     */
    public transform(value: string): number {
        try {
            return parseFloat(value);
        } catch {
            return 0;
        }
    }
}
