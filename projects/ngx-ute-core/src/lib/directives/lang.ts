import { Directive, ElementRef, forwardRef, HostListener } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { LangService } from "../services/lang.service";

@Directive({
    selector: "[uteLangInput]",
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MultilangInputDirective),
            multi: true,
        },
    ],
})
export class MultilangInputDirective implements ControlValueAccessor {
    private fullValue: string = "";
    private onChange = (value: any) => {};
    private onTouched = () => {};
    private readonly langCode: string = this.langService.current();
    private readonly langDefCode: string = this.langService.default();

    constructor(private readonly el: ElementRef<HTMLInputElement>, private readonly langService: LangService) {}

    writeValue(value: string): void {
        this.fullValue = value || "";
        let extracted = this.extractLangText(this.fullValue, this.langCode);
        this.el.nativeElement.value = extracted;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        this.el.nativeElement.disabled = isDisabled;
    }

    @HostListener("input", ["$event.target.value"])
    onInput(value: string): void {
        const updated = this.updateLangText(this.fullValue, this.langCode, value);
        this.fullValue = updated;
        this.onChange(updated);
    }

    @HostListener("blur")
    onBlur(): void {
        this.onTouched();
    }

    private extractLangText(value: string, lang: string, def: boolean = false): string {
        const regex = new RegExp(`\\[${lang}\\](.*?)(?=\\[|$)`);
        const match = value.match(regex);
        let text = match ? match[1].trim() : "";
        if (!text && !def) {
            const defaultValue = this.extractLangText(value, this.langDefCode, true);
            text = defaultValue;
        } else if (!text && def) {
            this.fullValue = `[${this.langDefCode}]${value}`;
            text = value;
            this.onChange(this.fullValue);
        }
        return text || value;
    }

    private updateLangText(value: string, lang: string, newText: string): string {
        const regex = new RegExp(`(\\[${lang}\\])(.*?)(?=\\[|$)`);
        if (value.match(regex)) {
            return value.replace(regex, `$1${newText}`);
        } else {
            return value + `[${lang}]${newText}`;
        }
    }
}
