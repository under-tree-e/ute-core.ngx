/* Module imports */
import { NgClass } from "@angular/common";
import { afterNextRender, afterRender, Component, EventEmitter, Input, OnDestroy, Output, SimpleChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";

/* Project imports */
import { PaginationData } from "../../interfaces/pagination";

@Component({
    selector: "ute-paginator",
    standalone: true,
    imports: [NgClass],
    templateUrl: "paginator.html",
})
export class UtePaginator implements OnDestroy {
    public page: number = 0;
    public pageRange: number[] = [this.page];
    public pageList: number[] = [];
    public displayList: number[] = [];
    public resizerOpen: boolean = false;
    public initPageSize: number = 0;

    private lastPageHeight: number = 0;

    private readonly subscriptions = new Subscription();

    @Input() public all: string = "all";
    @Input() public itemsCount: number = 0;
    @Input() public pageSize: number = 10;
    @Input() public showSingle: boolean = false;
    @Input() public loader: boolean = true;
    @Input() public loaderText: string = "Load more";
    @Input() public loaderOnly: boolean = false;
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
                }
            })
        );
    }

    /**
     * Emitted when page changes
     */
    ngOnInit() {
        this.initPageSize = this.pageSize;
        this.lastPageHeight = document.body.scrollHeight;
        this.changePage.emit({ page: this.page, pageSize: this.pageSize });
    }

    /**
     * Responds to changes in input properties.
     *
     * @param changes - An object of changes to the component's input properties.
     */
    ngOnChanges(changes: SimpleChanges) {
        if (changes["itemsCount"].currentValue != changes["itemsCount"].previousValue) {
            this.change(0, { init: true });
        }
    }

    /**
     * Clean up subscriptions when the component is destroyed.
     */
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
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
            // const ph: number = document.body.offsetHeight;
            console.log(this.lastPageHeight);

            this.page = page;
            const pages: number = Math.ceil(this.itemsCount / this.pageSize) || 1;

            this.pageList = Array(pages)
                .fill(1)
                .map((x, i) => i);

            this.displayList = this.getValues([...this.pageList], page);

            this.router
                .navigate([], {
                    relativeTo: this.activatedRoute,
                    queryParams: { p: page, s: this.pageSize },
                    queryParamsHandling: "merge",
                    skipLocationChange: true,
                })
                .then(() => {
                    // afterRender(() => {
                    // console.log(111);

                    setTimeout(() => {
                        window.scrollTo({
                            top: this.lastPageHeight,
                            // behavior: "smooth",
                        });
                    }, 0);
                    // });
                });

            if (!options?.init) {
                this.changePage.emit({ page: this.page, pageSize: this.pageSize, load: options?.load ?? false });
            }

            setTimeout(() => {
                this.lastPageHeight = document.body.scrollHeight;
            }, 500);

            // setTimeout(() => {
            //     window.scrollTo({
            //         top: document.body.scrollHeight,
            //         // behavior: "smooth",
            //     });
            // }, 5);
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
}
