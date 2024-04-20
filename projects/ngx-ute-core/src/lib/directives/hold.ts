import { Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { fromEvent, merge, Subscription } from "rxjs";
import { map } from "rxjs/operators";

@Directive({
    selector: "[uteHold]",
    // standalone: true,
})
export class HoldDirective implements OnDestroy {
    private subscriptions = new Subscription();
    private isHold: boolean = false;
    private holdTime: any = null;

    @Input() public eventTick: boolean = false;
    @Output() public onHold: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(private elementRef: ElementRef) {
        const domElement: HTMLElement = elementRef.nativeElement;

        const mouseStarts = fromEvent<MouseEvent>(domElement, "mousedown").pipe(map(this.getActions));
        const mouseMoves = fromEvent<MouseEvent>(domElement, "mousemove").pipe(map(this.getActions));
        const mouseEnds = fromEvent<MouseEvent>(domElement, "mouseup").pipe(map(this.getActions));
        const mouseCancels = fromEvent<MouseEvent>(domElement, "mouseout").pipe(map(this.getActions));

        const touchStarts = fromEvent<TouchEvent>(domElement, "touchstart").pipe(map(this.getActions));
        const touchMoves = fromEvent<TouchEvent>(domElement, "touchmove").pipe(map(this.getActions));
        const touchEnds = fromEvent<TouchEvent>(domElement, "touchend").pipe(map(this.getActions));
        const touchCancels = fromEvent<TouchEvent>(domElement, "touchcancel").pipe(map(this.getActions));

        const allStarts = merge(touchStarts, mouseStarts);
        const allEnds = merge(touchMoves, mouseMoves, touchEnds, mouseEnds, touchCancels, mouseCancels);

        this.subscriptions.add(
            allStarts.subscribe((action: any) => {
                this.startAction(action);
            })
        );
        this.subscriptions.add(
            allEnds.subscribe(() => {
                if (this.isHold) {
                    this.endAction();
                }
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private endAction() {
        clearTimeout(this.holdTime);
        this.holdTime = null;
        this.isHold = false;
    }

    private startAction(action: { status: boolean; event: TouchEvent | MouseEvent }) {
        this.endAction();

        if (action.status) {
            this.isHold = true;
            action.event.preventDefault();
            action.event.this.holdTime = setTimeout(() => {
                // action.event.preventDefault();
                this.onHold.emit(true);
                this.endAction();
            }, 1000);
        }
    }

    private getActions(event: TouchEvent | MouseEvent): { status: boolean; event: TouchEvent | MouseEvent } {
        let status: boolean = false;
        if ((event.type === "mousedown" && (event as MouseEvent).button == 0) || event.type === "touchstart") {
            status = true;
        }
        return { status: status, event: event };
    }
}
