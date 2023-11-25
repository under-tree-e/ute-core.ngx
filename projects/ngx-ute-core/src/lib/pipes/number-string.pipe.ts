import { Pipe, PipeTransform } from "@angular/core";
import { DecimalPipe } from "@angular/common";

@Pipe({
    name: "uteNumber",
})
export class NumberStringPipe implements PipeTransform {
    private lookup: any[] = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        { value: 1e9, symbol: "G" },
        { value: 1e12, symbol: "T" },
        { value: 1e15, symbol: "P" },
        { value: 1e18, symbol: "E" },
    ];

    /**
     * Covert number to small string like `"2k"`
     * @param value - base number to change
     * @param digits - number digits to display before string value
     * @returns `string` value
     */
    public transform(value: number, digits?: number): string {
        let rx: RegExp = /\.0+$|(\.[0-9]*[1-9])0+$/;
        let item = this.lookup
            .slice()
            .reverse()
            .find((item) => {
                return value >= item.value;
            });

        if (item && digits) {
            if (item && value.toString().length > digits) {
                return new DecimalPipe("en-US").transform((value / item.value).toFixed(1).replace(rx, "$1")) + item.symbol;
            } else {
                return new DecimalPipe("en-US").transform(value)?.toString() || "0";
            }
        } else {
            return new DecimalPipe("en-US").transform(value)?.toString() || "0";
        }
    }
}
