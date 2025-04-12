import { Directive, ElementRef, forwardRef, HostListener } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { LangService } from "../services/lang.service";

@Directive({
    selector: "[uteLangInput]",
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

    constructor(private readonly el: ElementRef<HTMLInputElement>, private readonly langService: LangService) {}

    // Called by Angular when model -> view
    writeValue(value: string): void {
        this.fullValue = value || "";
        const extracted = this.extractLangText(this.fullValue, this.langCode);
        this.el.nativeElement.value = extracted;
    }

    // Called by Angular to register view -> model change
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
        this.onChange(updated); // Notify Angular
    }

    @HostListener("blur")
    onBlur(): void {
        this.onTouched();
    }

    private extractLangText(value: string, lang: string): string {
        const regex = new RegExp(`\\[${lang}\\](.*?)(?=\\[|$)`);
        const match = value.match(regex);
        return match ? match[1].trim() : "";
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
