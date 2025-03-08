/* Module imports */
import { NgClass, NgTemplateOutlet } from "@angular/common";
import { Component, EventEmitter, Input, OnDestroy, Output, SimpleChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { TemplatePortal, PortalModule } from "@angular/cdk/portal";

/* Project imports */
import { PaginationData } from "../../interfaces/pagination";

@Component({
    selector: "ute-paginator",
    standalone: true,
    imports: [NgClass, PortalModule, NgTemplateOutlet],
    templateUrl: "paginator.html",
})
export class UtePaginator implements OnDestroy {
    public page: number = 0;
    public pageRange: number[] = [];
    public pageList: number[] = [];
    public displayList: number[] = [];
    public resizerOpen: boolean = false;
    public initPageSize: number = 0;
    public arrowLeft: any = null;
    public arrowRight: any = null;
    public resizerPortal: TemplatePortal = null!;
    public loaderPortal: TemplatePortal = null!;

    private lastPageHeight: number = 0;
    private scrollChecker: any = null;

    private readonly subscriptions = new Subscription();

    @Input() public displayText: boolean = true;
    @Input() public all: string = "all";
    @Input() public itemsCount: number = 0;
    @Input() public pageSize: number = 10;
    @Input() public showSingle: boolean = false;
    @Input() public loader: boolean = true;
    @Input() public loaderText: string = "Load more";
    @Input() public loaderOnly: boolean = false;
    @Input() public itemsList: any[] = [];
    @Output() public changePage: EventEmitter<PaginationData> = new EventEmitter<PaginationData>();

    /**
     * Constructor
     *
     * @param activatedRoute - Reference to ActivatedRoute
     * @param router - Reference to Router
     */
    constructor(private readonly activatedRoute: ActivatedRoute, private readonly router: Router) {
        this.subscriptions.add(
            activatedRoute.queryParams.subscribe((p: any) => {
                if (Object.keys(p).length) {
                    this.page = parseInt(p.p);
                    this.pageSize = parseInt(p.s);
                    this.initPageSize = this.pageSize;
                }
            })
        );
    }

    /**
     * Emitted when page changes
     */
    ngOnInit() {
        this.pageRange = [this.page];
        this.initPageSize = this.pageSize;
        this.lastPageHeight = window.scrollY;
        this.changePage.emit({ page: this.page, pageSize: this.pageSize });
    }

    /**
     * Responds to changes in input properties.
     *
     * @param changes - An object of changes to the component's input properties.
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes["itemsCount"]?.currentValue != changes["itemsCount"]?.previousValue) {
            this.change(this.page ?? 0, { init: true });
        } else if (changes["itemsList"]) {
            this.stopScrollChecking();
        }
    }

    /**
     * Clean up subscriptions when the component is destroyed.
     */
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    /**
     * Resets the paginator to the first page and updates the page range.
     * This method sets the page range to start at 0 and triggers a page change.
     */
    public resetPage() {
        this.pageRange = [0];
        this.change(0);
    }

    /**
     * Emits a page change event with the current page and page size.
     * This can be used to reload the page without changing the page number.
     */
    public reloadPage() {
        this.changePage.emit({ page: this.page, pageSize: this.pageSize });
    }

    /**
     * Resizes the paginator page size.
     *
     * @param value - The new page size.
     */
    public resize(value: number) {
        if (this.pageSize === value && !this.resizerOpen) {
            this.resizerOpen = true;
        } else if (this.resizerOpen) {
            this.pageSize = value;
            this.resizerOpen = false;
            this.change(0);
        }
    }

    /**
     * Changes the paginator page to the given page number and emits an event with the page data.
     *
     * @param page - The page number to change to.
     * @param options - An optional object with the following properties.
     */
    public change(page: number, options?: { init?: boolean; load?: boolean }) {
        try {
            this.lastPageHeight = window.scrollY;
            if (!options?.load) {
                this.pageRange = [page];
            }

            const pages: number = Math.ceil(this.itemsCount / this.pageSize) || 1;

            this.pageList = Array(pages)
                .fill(1)
                .map((x, i) => i);

            this.displayList = this.getValues([...this.pageList], page);

            if (page !== this.page || this.pageSize !== this.initPageSize) {
                this.router
                    .navigate([], {
                        relativeTo: this.activatedRoute,
                        queryParams: { p: page, s: this.pageSize },
                        queryParamsHandling: "merge",
                        skipLocationChange: true,
                    })
                    .then(() => {
                        this.startScrollChecking();
                    });
            }

            this.page = page;

            if (!options?.init) {
                this.changePage.emit({ page: this.page, pageSize: this.pageSize, load: options?.load ?? false });
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    /**
     * Loads the next page of items by incrementing the current page and changing the paginator page.
     * Emits an event with the page data and the load flag set to true.
     */
    public load() {
        const nextPage: number = this.page + 1;
        this.pageRange.push(nextPage);
        this.change(nextPage, { load: true });
    }

    /**
     * Given an array of page numbers and the current page, returns an array of page numbers
     * that should be shown in the paginator. The returned array is at most 5 elements long.
     * If the current page is at or near the start of the array, the first 5 elements are returned.
     * If the current page is at or near the end of the array, the last 5 elements are returned.
     * Otherwise, the current page and the 2 pages before and after it are returned.
     *
     * @param array - The array of page numbers.
     * @param currentValue - The current page number.
     *
     * @returns An array of at most 5 page numbers that should be shown in the paginator.
     */
    private getValues(array: number[], currentValue: number) {
        if (array.length <= 5) {
            return array;
        }

        let index = array.indexOf(currentValue);
        let result = [];

        if (index <= 2) {
            result = array.slice(0, 5);
        } else if (index >= array.length - 2) {
            result = array.slice(-5);
        } else {
            result = array.slice(index - 2, index + 3);
        }

        return result;
    }

    /**
     * Starts the scroll checking process that ensures the page remains at the last known
     * scroll position after changing pages. This helps prevent unwanted scrolling behaviors.
     *
     * If the page was previously scrolled to a non-zero position, we immediately scroll to
     * that position. Then, we start a 5ms interval that checks if the page has been scrolled
     * away from the last known position. If it has, we scroll it back to the last known position.
     *
     * The interval is cleared when the component is destroyed or when the page is changed.
     */
    private startScrollChecking() {
        if (this.lastPageHeight !== 0) {
            setTimeout(() => {
                window.scrollTo({
                    top: this.lastPageHeight,
                });
            }, 0);

            this.scrollChecker = setInterval(() => {
                if (this.lastPageHeight !== window.scrollY) {
                    window.scrollTo({
                        top: this.lastPageHeight,
                    });
                }
            }, 5);
        }
    }

    /**
     * Stops the scroll checking process by clearing the interval that checks
     * for changes in the page scroll position. This helps prevent unwanted
     * scrolling behaviors. The interval is cleared after a 200ms delay to ensure
     * any pending scroll actions are completed.
     */

    private stopScrollChecking() {
        setTimeout(() => {
            clearInterval(this.scrollChecker);
            this.scrollChecker = null;
        }, 200);
    }
}
