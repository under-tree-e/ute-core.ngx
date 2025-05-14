/* Module imports */
import { Pipe, PipeTransform } from "@angular/core";

/* Project imports */

@Pipe({
    name: "utePhone",
    pure: false,
    standalone: true,
})
export class PhonePipe implements PipeTransform {
    /**
     * Transforms a phone number to a formatted string or reverts it to digits only.
     *
     * @param value - The phone number as a number or string.
     * @param revert - If true, removes all non-digit characters from the phone number.
     * @returns The formatted phone number as a string, or digits only if revert is true.
     */
    public transform(value: number | string, revert = false): string {
        const phone = value.toString();

        if (revert) {
            return phone.replace(/\D/g, "");
        }

        const regex = /^(\d{1,3})(\d{3})(\d{2})(\d{2})$/;
        const result = "+$1($2) $3-$4";

        return phone.replace(regex, result);
    }
}
