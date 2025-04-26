/* Module imports */
import { Directive, ElementRef, forwardRef, HostListener } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

/* Project imports */
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

    /**
     * Writes a value to the input element after extracting the language-specific
     * text based on the current language code.
     *
     * @param value - The full text value containing multiple language segments.
     */
    public writeValue(value: string): void {
        this.fullValue = value || "";
        let extracted = this.extractLangText(this.fullValue, this.langCode);
        this.el.nativeElement.value = extracted;
    }

    /**
     * Registers a callback function to be called when the input value changes.
     *
     * This callback is invoked by the framework whenever the value of the input
     * element changes (e.g. when the user types something). The callback takes
     * the new value as an argument.
     *
     * @param fn - The callback function to be invoked when the value changes.
     */
    public registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    /**
     * Registers a callback function to be called when the input element is blurred.
     *
     * This callback is invoked by the framework whenever the input element is blurred
     * (e.g. when the user clicks away from the input element). The callback takes no
     * arguments.
     *
     * @param fn - The callback function to be invoked when the input element is blurred.
     */
    public registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    /**
     * Called when the disabled state of the input element changes.
     *
     * The framework calls this method when the `disabled` property of the input
     * element changes. The component should update the state of the input element
     * accordingly.
     *
     * @param isDisabled - Whether the input element should be disabled.
     */
    public setDisabledState?(isDisabled: boolean): void {
        this.el.nativeElement.disabled = isDisabled;
    }

    @HostListener("input", ["$event.target.value"])
    /**
     * Updates the full text value by incorporating the input value for the current language.
     *
     * This method is triggered by the 'input' event on the host element. It updates the internal
     * state with the new language-specific text and invokes the registered change callback.
     *
     * @param value - The new input value to integrate into the full text value.
     */
    public onInput(value: string): void {
        const updated = this.updateLangText(this.fullValue, this.langCode, value);
        this.fullValue = updated;
        this.onChange(updated);
    }

    @HostListener("blur")
    /**
     * Triggered when the host element loses focus.
     *
     * This method is an implementation of the ControlValueAccessor interface. It
     * is invoked when the input element loses focus, and it notifies the framework
     * by invoking the registered onTouched callback.
     */
    public onBlur(): void {
        this.onTouched();
    }

    /**
     * Extracts the language-specific text from the full text value.
     *
     * Given a full text value containing multiple language segments, this method
     * extracts the language-specific text for the specified language code.
     * If the language-specific text is not found, it will fall back to the default
     * language code.
     *
     * @param value - The full text value containing multiple language segments.
     * @param lang - The language code to extract the language-specific text for.
     * @param def - Whether to fall back to the default language code if the language-specific
     *              text is not found.
     * @returns The extracted language-specific text.
     */
    private extractLangText(value: string, lang: string, def: boolean = false): string {
        const regex = new RegExp(`\\[${lang}\\](.*?)(?=\\[|$)`);
        const match = RegExp(regex).exec(value);
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

    /**
     * Updates the full text value by replacing the language-specific text for the given language
     * code with the new input value.
     *
     * If the full text value already contains a language-specific text for the given language code,
     * this method replaces it with the new input value. Otherwise, it appends a new language segment
     * to the full text value.
     *
     * @param value - The full text value containing multiple language segments.
     * @param lang - The language code to update the language-specific text for.
     * @param newText - The new input value to replace the language-specific text with.
     * @returns The updated full text value.
     */
    private updateLangText(value: string, lang: string, newText: string): string {
        const regex = new RegExp(`(\\[${lang}\\])(.*?)(?=\\[|$)`);
        if (RegExp(regex).exec(value)) {
            return value.replace(regex, `$1${newText}`);
        } else {
            return value + `[${lang}]${newText}`;
        }
    }
}
