import { Pipe, PipeTransform } from "@angular/core";
import { CoreService } from "../services/core.service";
import { DatePipe } from "@angular/common";

@Pipe({
    name: "uteDate",
})
export class DateStringPipe implements PipeTransform {
    constructor(private coreService: CoreService, private datePipe: DatePipe) {}
    /**
     *
     * @param value
     * @returns
     */
    public transform(value: Date | string, format: string, locale?: string): string {
        let dateZone: string = this.coreService.toIsoZone(value);
        let zone: string = dateZone.slice(-5);
        console.log(dateZone);
        console.log(zone);
        console.log(format);
        console.log(value);

        if (value) {
            console.log(111);
            console.log(this.datePipe);

            console.log(this.datePipe.transform(value, format));
            console.log(222);
            // return this.datePipe.transform(value, format, zone, locale) || "---";
            return "---";
        } else {
            return "---";
        }
    }
}
