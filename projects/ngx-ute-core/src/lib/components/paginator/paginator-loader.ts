/* Module imports */
import { TemplatePortal } from "@angular/cdk/portal";
import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from "@angular/core";

/* Project imports */
import { UtePaginator } from "./paginator";

@Component({
    selector: "ute-paginator-loader",
    standalone: true,
    template: `
        <ng-template>
            <ng-content></ng-content>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class UtePaginatorLoader {
    private portal: TemplatePortal = null!;

    @ViewChild(TemplateRef) private readonly template: TemplateRef<unknown> = null!;

    /**
     * Constructor
     *
     * @param viewContainerRef - Reference to the ViewContainerRef for creating the template portal
     * @param paginator - Reference to the UtePaginator component
     */
    constructor(private readonly viewContainerRef: ViewContainerRef, private readonly paginator: UtePaginator) {}

    /**
     * Initializes the template portal and assigns it to the paginator's loader portal.
     * This method is called after the view's initialization.
     */
    ngAfterViewInit() {
        this.portal = new TemplatePortal(this.template, this.viewContainerRef);
        this.paginator.loaderPortal = this.portal;
    }
}
