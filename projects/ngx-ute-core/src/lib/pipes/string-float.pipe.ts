/* Module imports */
import { Pipe, PipeTransform } from "@angular/core";

/* Project imports */

@Pipe({
    name: "uteFloat",
    pure: false,
    standalone: true,
})
export class StringFloatPipe implements PipeTransform {
    /**
     * Converts a string to a floating-point number.
     *
     * @param value - The string to convert.
     * @returns The floating-point number representation of the string,
     * or 0 if conversion fails.
     */
    public transform(value: string): number {
        try {
            return parseFloat(value);
        } catch {
            return 0;
        }
    }
}
