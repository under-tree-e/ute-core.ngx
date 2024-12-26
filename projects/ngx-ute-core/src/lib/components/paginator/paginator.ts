import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, OnDestroy, Output, SimpleChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { PaginationData } from "../../interfaces/pagination";
import { LangPipe } from "../../pipes/lang.pipe";

@Component({
    selector: "ute-paginator",
    standalone: true,
    imports: [NgClass, LangPipe, NgFor, NgIf],
    templateUrl: "paginator.html",
})
export class UtePaginator implements OnDestroy {
    public page: number = 0;
    public pageList: number[] = [];
    public displayList: number[] = [];
    public resizerOpen: boolean = false;

    private subscriptions = new Subscription();

    @Input() public all: string = "all";
    @Input() public itemsCount: number = 0;
    @Input() public pageSize: number = 10;
    @Input() public showSingle: boolean = false;
    @Output() public changePage: EventEmitter<PaginationData> = new EventEmitter<PaginationData>();

    constructor(private activatedRoute: ActivatedRoute, private router: Router) {
        this.subscriptions.add(
            activatedRoute.queryParams.subscribe((p: any) => {
                if (Object.keys(p).length) {
                    this.page = parseInt(p.p);
                    this.pageSize = parseInt(p.s);
                }
            })
        );
    }

    ngOnInit() {
        this.changePage.emit({ page: this.page, pageSize: this.pageSize });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes["itemsCount"].currentValue != changes["itemsCount"].previousValue) {
            this.change(0, true);
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    public resize(value: number) {
        if (this.pageSize === value && !this.resizerOpen) {
            this.resizerOpen = true;
        } else if (this.resizerOpen) {
            this.pageSize = value;
            this.resizerOpen = false;
            this.change(0);
        }
    }

    public change(page: number, init: boolean = false) {
        try {
            this.page = page;
            const pages: number = Math.ceil(this.itemsCount / this.pageSize) || 1;

            this.pageList = Array(pages)
                .fill(1)
                .map((x, i) => i);

            this.displayList = this.getValues([...this.pageList], page);

            this.router.navigate([], {
                relativeTo: this.activatedRoute,
                queryParams: { p: page, s: this.pageSize },
                queryParamsHandling: "merge",
            });

            if (!init) {
                this.changePage.emit({ page: this.page, pageSize: this.pageSize });
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

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
