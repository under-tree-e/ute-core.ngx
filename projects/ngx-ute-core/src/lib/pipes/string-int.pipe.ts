/* Module imports */
import { Pipe, PipeTransform } from "@angular/core";

/* Project imports */

@Pipe({
    name: "uteInt",
    pure: false,
    standalone: true,
})
export class StringIntegerPipe implements PipeTransform {
    /**
     * Converts a string to an integer.
     *
     * @param value - The string to convert.
     * @returns The integer representation of the string,
     * or 0 if conversion fails.
     */
    public transform(value: string): number {
        try {
            return parseInt(value);
        } catch {
            return 0;
        }
    }
}
