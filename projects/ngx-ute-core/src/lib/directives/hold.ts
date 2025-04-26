/* Module imports */
import { Directive, EventEmitter, HostListener, Input, Output } from "@angular/core";

/* Project imports */

@Directive({
    selector: "[uteHold]",
    standalone: true,
})
export class HoldDirective {
    private isHold: boolean = false;
    private holdTimeout: any = null;
    private holdInterval: any = null;
    private currentTime: number = 0;
    private readonly event: TouchEvent | MouseEvent = {} as TouchEvent | MouseEvent;

    @Input() public eventTick: boolean = false;
    @Input() public onClick: boolean = false;
    @Input() public minTime: number = 500;
    @Input() public maxTime: number = 2000;
    @Output() public hold: EventEmitter<{ event: TouchEvent | MouseEvent; type: string }> = new EventEmitter<{ event: TouchEvent | MouseEvent; type: string }>();

    @HostListener("touchstart", ["$event"])
    @HostListener("mousedown", ["$event"])
    /**
     * Handle start event for hold directive
     * @param event Start event
     * @remarks
     * On start event, it checks if the event is `mousedown` event and left mouse button is pressed.
     * Then it calls `startAction` method to start the timer.
     * @example
     * <div (mousedown)="onStart($event)"></div>
     */
    onStart(event: TouchEvent | MouseEvent) {
        if ((event.type === "mousedown" && (event as MouseEvent).button === 0) || event.type !== "mousedown") {
            this.endAction();
            this.startAction();
        }
    }

    @HostListener("touchmove")
    @HostListener("mousemove")
    /**
     * Handle move event for hold directive
     * @remarks
     * On move event, it ends the timer and resets hold status.
     * @example
     * <div (mousemove)="onMove()"></div>
     */
    onMove() {
        this.endAction();
    }

    @HostListener("touchend", ["$event"])
    @HostListener("mouseup", ["$event"])
    @HostListener("mouseleave", ["$event"])
    /**
     * Handle end event for hold directive
     * @param event End event
     * @remarks
     * On end event, it checks if the hold directive is in hold status or not.
     * If not in hold status and click is enabled, it emits `click` event.
     * If in hold status, it emits `release` event.
     * @example
     * <div (mouseup)="onEnd($event)"></div>
     */
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
    /**
     * Prevents the default context menu from appearing on right-click or touch-hold.
     * @param event The context menu event triggered by right-click or touch-hold.
     * @remarks
     * This method is used to suppress the default browser context menu to allow
     * custom handling of right-click or touch-hold events.
     */
    contextPress(event: TouchEvent | MouseEvent) {
        event.preventDefault();
    }

    /**
     * Resets the hold directive status and clears timers.
     * @remarks
     * This method is used internally to reset the hold directive status and clear timers when the hold directive is not in use.
     * It is called automatically by the hold directive when events are triggered.
     * @example
     * this.endAction();
     */
    private endAction() {
        clearTimeout(this.holdTimeout);
        this.holdTimeout = null;
        clearInterval(this.holdInterval);
        this.holdInterval = null;
        this.isHold = false;
        this.currentTime = 0;
    }

    /**
     * Starts the hold timer and emits hold events.
     * @remarks
     * This method is used internally to start the hold timer and emit hold events.
     * It is called automatically by the hold directive when the `onStart` event is triggered.
     * The hold timer is started with a delay of `minTime` milliseconds.
     * During the hold timer, the `holding` event is emitted at intervals of 50ms until the `maxTime` is reached.
     * If `eventTick` is `false`, the `release` event is emitted immediately after the `hold` event.
     * @example
     * this.startAction();
     */
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
