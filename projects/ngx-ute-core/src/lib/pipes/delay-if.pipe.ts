import { AsyncPipe } from "@angular/common";
import { ChangeDetectorRef, Injector, OnDestroy, Pipe, PipeTransform } from "@angular/core";
import { Observable } from "rxjs";

enum DelayStatus {
    "close",
    "open",
    "process",
}

@Pipe({
    name: "dlif",
    pure: false,
})
export class DelayIf implements PipeTransform, OnDestroy {
    private asyncPipe: AsyncPipe;
    private delayStatus: DelayStatus = DelayStatus.close;

    constructor(private injector: Injector) {
        this.asyncPipe = new AsyncPipe(injector.get(ChangeDetectorRef));
    }

    ngOnDestroy() {
        this.asyncPipe.ngOnDestroy();
    }

    /**
     * Make `NgIf` wait some time before apply close action
     * @param value - Value to valid check
     * @param delay - Time to wait until return `false` (only if pre - `true`)
     * @returns status
     */
    public transform(value: any, delay?: number): boolean {
        return this.asyncPipe.transform(this.delay(value, delay)) || false;
    }

    /**
     * Make `NgIf` wait some time before apply close action
     * @param value - Value to valid check
     * @param delay - Time to wait until return `false` (only if pre - `true`)
     * @returns status
     */
    private delay(value: any, delay?: number): Observable<boolean> {
        return new Observable((obs) => {
            if (value && this.delayStatus === DelayStatus.close) {
                this.delayStatus = DelayStatus.open;
                obs.next(true);
            } else if (value && this.delayStatus === DelayStatus.open) {
                obs.next(true);
            } else if (!value && this.delayStatus === DelayStatus.open) {
                this.delayStatus = DelayStatus.process;
                setTimeout(
                    () => {
                        this.delayStatus = DelayStatus.close;
                        obs.next(false);
                    },
                    delay ? delay : 1 * 1000
                );
                obs.next(true);
            } else if (!value && this.delayStatus === DelayStatus.process) {
                obs.next(true);
            } else if (!value && this.delayStatus === DelayStatus.close) {
                obs.next(false);
            } else {
                obs.next(false);
            }
        });
    }
}
