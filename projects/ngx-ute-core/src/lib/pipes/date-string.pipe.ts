import { Pipe, PipeTransform } from "@angular/core";
import { CoreService } from "../services/core.service";
import { DatePipe } from "@angular/common";

@Pipe({
    name: "uteDate",
})
export class DateStringPipe implements PipeTransform {
    private datePipe: DatePipe = new DatePipe("en-US");

    constructor(private coreService: CoreService) {}
    /**
     *
     * @param value
     * @returns
     */
    public transform(value: Date | string, format: string, locale?: string): string {
        let dateZone: string = this.coreService.toIsoZone(value);
        let zone: string = dateZone.slice(-5);

        if (value) {
            return this.datePipe.transform(value, format, zone, locale) || "---";
        } else {
            return "---";
        }
    }
}
