import { Directive, ElementRef, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { fromEvent, merge, Subscription } from "rxjs";
import { map } from "rxjs/operators";

@Directive({
    selector: "[uteHold]",
    // standalone: true,
})
export class HoldDirective implements OnDestroy {
    private subscriptions = new Subscription();
    private isAllow: boolean = false;
    private isHold: boolean = false;
    private holdTimeout: any = null;
    private holdInterval: any = null;
    private currentTime: number = 0;
    private event: TouchEvent | MouseEvent = {} as TouchEvent | MouseEvent;

    @Input() public eventTick: boolean = false;
    @Input() public minTime: number = 500;
    @Input() public maxTime: number = 2000;
    @Output() public onHold: EventEmitter<{ event: TouchEvent | MouseEvent; type: string }> = new EventEmitter<{ event: TouchEvent | MouseEvent; type: string }>();

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
            allStarts.subscribe((action) => {
                this.isAllow = action.allow;
                this.event = action.event;

                if (this.isAllow) {
                    this.endAction();
                    this.startAction();
                }
            })
        );
        this.subscriptions.add(
            allEnds.subscribe(() => {
                if (!this.isHold && this.isAllow) {
                    this.onHold.emit({ type: "click", event: this.event });
                    this.isAllow = false;
                } else if (this.isHold && this.isAllow) {
                    this.onHold.emit({ type: "release", event: this.event });
                }
                this.endAction();
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private endAction() {
        clearTimeout(this.holdTimeout);
        this.holdTimeout = null;
        clearInterval(this.holdInterval);
        this.holdInterval = null;
        this.isHold = false;
        this.currentTime = 0;
    }

    private startAction() {
        if (this.isAllow) {
            this.holdTimeout = setTimeout(() => {
                this.isHold = true;
                this.onHold.emit({ type: "hold", event: this.event });
                this.currentTime = this.minTime;
                if (this.eventTick) {
                    this.holdInterval = setInterval(() => {
                        this.currentTime += 50;
                        this.onHold.emit({ type: "holding", event: this.event });
                        if (this.maxTime !== 0 && this.currentTime >= this.maxTime) {
                            this.onHold.emit({ type: "release", event: this.event });
                            this.isAllow = false;
                            this.endAction();
                        }
                    }, 50);
                } else {
                    this.onHold.emit({ type: "release", event: this.event });
                    this.isAllow = false;
                    this.endAction();
                }
            }, this.minTime);
        }
    }

    private getActions(event: TouchEvent | MouseEvent): { allow: boolean; event: TouchEvent | MouseEvent } {
        let isAllow = false;

        if ((event.type === "mousedown" && (event as MouseEvent).button == 0) || event.type === "touchstart") {
            event.preventDefault();
            isAllow = true;
        }
        return { allow: isAllow, event: event };
    }
}
