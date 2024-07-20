import { Directive, EventEmitter, HostListener, Input, Output } from "@angular/core";

@Directive({
    selector: "[uteHold]",
    // standalone: true,
})
export class HoldDirective {
    private isHold: boolean = false;
    private holdTimeout: any = null;
    private holdInterval: any = null;
    private currentTime: number = 0;
    private event: TouchEvent | MouseEvent = {} as TouchEvent | MouseEvent;

    @Input() public eventTick: boolean = false;
    @Input() public onClick: boolean = false;
    @Input() public minTime: number = 500;
    @Input() public maxTime: number = 2000;
    @Output() public hold: EventEmitter<{ event: TouchEvent | MouseEvent; type: string }> = new EventEmitter<{ event: TouchEvent | MouseEvent; type: string }>();

    @HostListener("touchstart", ["$event"])
    @HostListener("mousedown", ["$event"])
    onStart(event: TouchEvent | MouseEvent) {
        if ((event.type === "mousedown" && (event as MouseEvent).button === 0) || event.type !== "mousedown") {
            this.endAction();
            this.startAction();
        }
    }

    @HostListener("touchmove")
    @HostListener("mousemove")
    onMove() {
        this.endAction();
    }

    @HostListener("touchend", ["$event"])
    @HostListener("mouseup", ["$event"])
    @HostListener("mouseleave", ["$event"])
    onEnd(event: TouchEvent | MouseEvent) {
        if (!this.isHold && this.onClick && this.holdTimeout) {
            this.hold.emit({ type: "click", event: event });
            event.preventDefault();
        } else if (this.isHold) {
            this.hold.emit({ type: "release", event: event });
        }
        this.endAction();
    }

    @HostListener("contextmenu", ["$event"])
    contextPress(event: TouchEvent | MouseEvent) {
        event.preventDefault();
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
        this.holdTimeout = setTimeout(() => {
            this.isHold = true;
            this.hold.emit({ type: "hold", event: this.event });
            this.currentTime = this.minTime;
            if (this.eventTick) {
                this.holdInterval = setInterval(() => {
                    this.currentTime += 50;
                    this.hold.emit({ type: "holding", event: this.event });
                    if (this.maxTime !== 0 && this.currentTime >= this.maxTime) {
                        this.hold.emit({ type: "release", event: this.event });
                        this.endAction();
                    }
                }, 50);
            } else {
                this.hold.emit({ type: "release", event: this.event });
                this.endAction();
            }
        }, this.minTime);
    }
}
