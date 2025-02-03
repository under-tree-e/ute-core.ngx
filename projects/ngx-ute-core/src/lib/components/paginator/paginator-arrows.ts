/* Module imports */
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, ViewEncapsulation } from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";

/* Project imports */
import { UtePaginator } from "./paginator";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: "ute-paginator-arrows",
    standalone: true,
    template: `
        <span #baseTemplate>
            <ng-content></ng-content>
        </span>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [NgTemplateOutlet],
})
export class UtePaginatorArrows {
    @ViewChild("baseTemplate") private readonly template!: ElementRef;

    /**
     * Constructor
     *
     * @param paginator Reference to the UtePaginator component
     * @param sanitizer DomSanitizer for sanitizing the arrow HTML content
     */
    constructor(private readonly paginator: UtePaginator, private readonly sanitizer: DomSanitizer) {}

    /**
     * Sets up the template portal for paginator arrows and assigns the sanitized HTML
     * content to the paginator's arrowLeft and arrowRight properties.
     * This method is invoked after the view initialization.
     */
    ngAfterViewInit() {
        const templateElement = this.template.nativeElement;
        const templateHtml = templateElement.innerHTML;
        const sanitizedHtml = this.sanitizer.bypassSecurityTrustHtml(templateHtml);

        this.paginator.arrowLeft = sanitizedHtml;
        this.paginator.arrowRight = sanitizedHtml;
    }
}
