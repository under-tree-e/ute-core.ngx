import { NgClass, NgFor } from "@angular/common";
import { Component, EventEmitter, OnDestroy, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { PaginationData } from "../../interfaces/pagination";
import { LangPipe } from "../../pipes/lang.pipe";
import { HttpService } from "../../services/http.service";
import { UteApis } from "../../interfaces/api";
import { UteObjects } from "../../interfaces/object";

@Component({
    selector: "ute-paginator",
    standalone: true,
    imports: [NgClass, LangPipe, NgFor],
    templateUrl: "paginator.html",
    styleUrl: "paginator.scss",
})
export class Paginator implements OnDestroy {
    public page: number = 0;
    public pageList: number[] = [];
    public pageSize: number = 10;
    public resizerOpen: boolean = false;
    public numberItems: number = 0;

    private subscriptions = new Subscription();

    @Output() public changePage: EventEmitter<PaginationData> = new EventEmitter<PaginationData>();

    constructor(private httpService: HttpService, private activatedRoute: ActivatedRoute, private router: Router) {
        this.subscriptions.add(
            activatedRoute.queryParams.subscribe((p: any) => {
                if (Object.keys(p).length) {
                    this.page = parseInt(p.p);
                    this.pageSize = parseInt(p.s);
                }
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    public async update(table: string, filter?: any[]) {
        try {
            const json: UteApis<any>[] = [
                {
                    table: table,
                    select: "COUNT",
                },
            ];
            if (filter && filter.length) {
                json[0].where = {
                    AND: filter,
                };
            }

            const result: UteObjects<any[]> = await this.httpService.httpRequest<any[]>("GET", json);
            this.numberItems = result[`${table}Count`] as any;
            this.page = 0;

            this.change(this.page);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    public resize(value: number) {
        if (this.pageSize === value) {
            this.resizerOpen = !this.resizerOpen;
        } else {
            this.pageSize = value;
            this.resizerOpen = false;
            this.change(0);
        }
    }

    public change(page: number) {
        try {
            this.page = page;
            const pages: number = Math.ceil(this.numberItems / this.pageSize) || 1;

            this.pageList = Array(pages)
                .fill(1)
                .map((x, i) => i);

            this.pageList = this.getValues(this.pageList, page);

            this.router.navigate([], {
                relativeTo: this.activatedRoute,
                queryParams: { p: page, s: this.pageSize },
                queryParamsHandling: "merge",
            });

            this.changePage.emit({ page: this.page, pageSize: this.pageSize });
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

        if (index <= 1) {
            result = array.slice(0, 4);
            result.push(array[array.length - 1]);
        } else if (index >= array.length - 2) {
            result = array.slice(-4);
            result.unshift(array[0]);
        } else {
            result = array.slice(index - 1, index + 2);
            result.unshift(array[0]);
            result.push(array[array.length - 1]);
        }

        return result;
    }
}

// @NgModule({
//     declarations: [Paginator],
//     exports: [Paginator],
//     imports: [CommonModule, NgxUteCoreModule],
// })
// export class CrossModule {}
