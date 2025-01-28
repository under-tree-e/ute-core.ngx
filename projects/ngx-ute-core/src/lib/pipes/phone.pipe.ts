import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "utePhone",
    pure: false,
    standalone: true,
})
export class PhonePipe implements PipeTransform {
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
