/* Module imports */
import { Pipe, PipeTransform } from "@angular/core";
import { DatePipe } from "@angular/common";

/* Project imports */
import { CoreService } from "../services/core.service";

@Pipe({
    name: "uteDate",
    pure: false,
    standalone: true,
})
export class DateStringPipe implements PipeTransform {
    private readonly datePipe: DatePipe = new DatePipe("en-US");

    constructor(private readonly coreService: CoreService) {}

    /**
     * Transform a date to a string based on a given format.
     * Automatically apply timezone offset from date object.
     *
     * @param value - Date object or date string to transform
     * @param format - Format string to use
     * @param locale - Optional locale to use
     *
     * @returns The transformed string
     */
    public transform(value: Date | string, format: string, locale?: string): string {
        let dateZone: string = this.coreService.toIsoZone(value);
        let zone: string = dateZone.slice(-5);

        if (value) {
            return this.datePipe.transform(value, format, zone, locale) ?? "---";
        } else {
            return "---";
        }
    }
}
