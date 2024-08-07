import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "uteLengCut",
    pure: false,
    standalone: true,
})
export class LengthCutPipe implements PipeTransform {
    /**
     * Cut string length and add dots
     * @param value - String to cut
     * @param length - Max number of symols
     * @returns - New string
     */
    public transform(value: string, length: number): string {
        if (value.length > length) {
            return `${value.slice(0, length - 3)}...`;
        } else {
            return value;
        }
    }
}
