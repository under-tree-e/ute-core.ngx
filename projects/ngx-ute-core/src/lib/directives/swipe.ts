/* Module imports */
import { Directive, ElementRef, EventEmitter, HostBinding, Input, NgZone, OnDestroy, OnInit, Output } from "@angular/core";
import { fromEvent, merge, Observable, race, Subscription } from "rxjs";
import { elementAt, map, switchMap, takeUntil, tap } from "rxjs/operators";

/* Project imports */
import { SwipeCoordinates, SwipeDirection, SwipeDirectionConst, SwipeEvent, SwipePhase, SwipeScroll, SwipeStartEvent, SwipeSubscriptionConfig } from "../interfaces/swipe";

@Directive({
    selector: "[uteSwipe]",
    standalone: true,
})
export class SwipeDirective implements OnInit, OnDestroy {
    @HostBinding("style.user-select") userSelect: string = "none";

    private readonly subscriptions = new Subscription();
    private readonly swipeDirection: typeof SwipeDirectionConst = SwipeDirectionConst;

    @Input() swipeAxis: SwipeScroll = SwipeScroll.both;
    @Input() touchEndTrigger: boolean = true;
    @Input() moveSize: number = 50;
    @Input() allMoves: boolean = false;
    @Output() swipe: EventEmitter<SwipeEvent> = new EventEmitter<SwipeEvent>();

    constructor(private readonly elementRef: ElementRef, private readonly ngZone: NgZone) {}

    /**
     * Sets up the swipe directive.
     *
     * This method is called when the directive is initialized.
     * It sets up the event listeners for the swipe events.
     * The event listeners are added outside the Angular zone to prevent unnecessary change detection.
     */
    ngOnInit() {
        this.ngZone.runOutsideAngular(() => {
            this.subscriptions.add(
                this.createSwipeSubscription({
                    domElement: this.elementRef.nativeElement,
                    onSwipe: (swipeEvent: SwipeEvent) => this.swipe.emit(swipeEvent),
                })
            );
        });
    }

    /**
     * Unsubscribes from the swipe event subscription.
     *
     * This method is called when the directive is destroyed.
     * It unsubscribes from the swipe event subscription to prevent memory leaks.
     */
    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    /**
     * Creates a subscription to the swipe events.
     *
     * This method is an internal implementation detail of the `SwipeDirective` and should not be used directly.
     *
     * It sets up the event listeners for the swipe events (touchstart, touchmove, touchend, touchcancel, mousedown, mousemove, mouseup, mouseout) and
     * emits the swipe events to the `onSwipe` event handler.
     *
     * The event listeners are added outside the Angular zone to prevent unnecessary change detection.
     *
     * It returns a subscription that can be used to unsubscribe from the swipe events.
     *
     * @param {SwipeSubscriptionConfig} config The configuration object for the swipe subscription.
     * @returns {Subscription} The subscription to the swipe events.
     */
    private createSwipeSubscription({ domElement, onSwipe }: SwipeSubscriptionConfig): Subscription {
        if (!(domElement instanceof HTMLElement)) {
            throw new Error("Provided domElement should be an instance of HTMLElement");
        }

        if (typeof onSwipe !== "function") {
            throw new Error("At swipe event handler functions should be provided: onSwipe");
        }

        const touchStarts = fromEvent<TouchEvent>(domElement, "touchstart").pipe(map(this.getCoordinates));
        const touchMoves = fromEvent<TouchEvent>(domElement, "touchmove").pipe(map(this.getCoordinates));
        const touchEnds = fromEvent<TouchEvent>(domElement, "touchend").pipe(map(this.getCoordinates));
        const touchCancels = fromEvent<TouchEvent>(domElement, "touchcancel").pipe(map(this.getCoordinates));

        const mouseStarts = fromEvent<MouseEvent>(domElement, "mousedown").pipe(map(this.getCoordinates));
        const mouseMoves = fromEvent<MouseEvent>(domElement, "mousemove").pipe(map(this.getCoordinates));
        const mouseEnds = fromEvent<MouseEvent>(domElement, "mouseup").pipe(map(this.getCoordinates));
        const mouseCancels = fromEvent<MouseEvent>(domElement, "mouseout").pipe(map(this.getCoordinates));

        const allStarts = merge(touchStarts, mouseStarts);
        const allMoves = merge(touchMoves, mouseMoves);
        const allEnds = merge(touchEnds, mouseEnds);
        const allCancels = merge(touchCancels, mouseCancels);

        const touchStartsWithDirection: Observable<SwipeStartEvent> = allStarts.pipe(
            tap((coordinates: SwipeCoordinates) => {
                onSwipe(this.getSwipeEvent(SwipePhase.start, null, coordinates));
            }),
            switchMap((touchStartEvent: SwipeCoordinates) =>
                allMoves.pipe(
                    elementAt(3),
                    map((touchMoveEvent: SwipeCoordinates) => ({
                        x: touchStartEvent.x,
                        y: touchStartEvent.y,
                        direction: this.getDirection(touchStartEvent, touchMoveEvent),
                    }))
                )
            )
        );

        return touchStartsWithDirection
            .pipe(
                switchMap((touchStartEvent) =>
                    allMoves.pipe(
                        map((touchMoveEvent) => this.getDistance(touchStartEvent, touchMoveEvent)),
                        tap((coordinates: SwipeCoordinates) => {
                            onSwipe(this.getSwipeEvent(SwipePhase.move, touchStartEvent, coordinates));
                        }),
                        takeUntil(
                            race(
                                allEnds.pipe(
                                    map((touchEndEvent) => this.getDistance(touchStartEvent, touchEndEvent)),
                                    tap((coordinates: SwipeCoordinates) => {
                                        if (this.touchEndTrigger) onSwipe(this.getSwipeEvent(SwipePhase.end, touchStartEvent, coordinates));
                                    })
                                ),
                                allCancels.pipe(
                                    map((touchCancelEvent) => this.getDistance(touchStartEvent, touchCancelEvent)),
                                    tap((coordinates: SwipeCoordinates) => {
                                        if (this.touchEndTrigger) onSwipe(this.getSwipeEvent(SwipePhase.cancel, touchStartEvent, coordinates));
                                    })
                                )
                            )
                        )
                    )
                )
            )
            .subscribe();
    }

    /**
     * Extracts the x and y coordinates from a touch or mouse event.
     * @param event The touch or mouse event containing coordinate data.
     * @returns An object containing the x and y coordinates.
     */
    private getCoordinates(event: TouchEvent | MouseEvent): SwipeCoordinates {
        if (event instanceof TouchEvent) {
            return {
                x: event.changedTouches[0].clientX,
                y: event.changedTouches[0].clientY,
            };
        } else {
            return {
                x: event.clientX,
                y: event.clientY,
            };
        }
    }

    /**
     * Calculates the distance between the start and move coordinates.
     * If `allMoves` is true, returns the exact difference between the coordinates.
     * If `allMoves` is false, returns 0 if the absolute difference is less than `moveSize`, otherwise returns the difference.
     * @param startCoordinates The start coordinates.
     * @param moveCoordinates The move coordinates.
     * @returns The distance between the start and move coordinates.
     */
    private getDistance(startCoordinates: SwipeCoordinates, moveCoordinates: SwipeCoordinates): SwipeCoordinates {
        if (this.allMoves) {
            return {
                x: moveCoordinates.x - startCoordinates.x,
                y: moveCoordinates.y - startCoordinates.y,
            };
        } else {
            return {
                x: Math.abs(moveCoordinates.x - startCoordinates.x) < this.moveSize ? 0 : moveCoordinates.x - startCoordinates.x,
                y: Math.abs(moveCoordinates.y - startCoordinates.y) < this.moveSize ? 0 : moveCoordinates.y - startCoordinates.y,
            };
        }
    }

    /**
     * Calculates the direction of the swipe based on the start and move coordinates.
     * The direction is determined by comparing the absolute differences of the x and y coordinates.
     * If the absolute difference of the x coordinate is less than the absolute difference of the y coordinate,
     * the direction is determined by the y coordinate. Otherwise, the direction is determined by the x coordinate.
     * @param startCoordinates The start coordinates.
     * @param moveCoordinates The move coordinates.
     * @returns The direction of the swipe.
     */
    private getDirection(startCoordinates: SwipeCoordinates, moveCoordinates: SwipeCoordinates): SwipeDirection {
        const { x, y } = this.getDistance(startCoordinates, moveCoordinates);
        if ((Math.abs(x) < Math.abs(y) && this.swipeAxis === SwipeScroll.both) || this.swipeAxis === SwipeScroll.vertical) {
            return Math.abs(startCoordinates.y) < Math.abs(moveCoordinates.y) ? SwipeDirection.down : SwipeDirection.up;
        } else {
            return Math.abs(startCoordinates.x) < Math.abs(moveCoordinates.x) ? SwipeDirection.right : SwipeDirection.left;
        }
    }

    /**
     * Generates a `SwipeEvent` object for the given swipe phase and coordinates.
     *
     * @param phase - The current phase of the swipe (start, move, end, or cancel).
     * @param touchStartEvent - The initial swipe event containing start coordinates and direction, or null if not applicable.
     * @param coordinates - The current coordinates of the swipe.
     *
     * @returns A `SwipeEvent` object containing the phase, direction, and distance of the swipe.
     * If `touchStartEvent` is null, returns a swipe event with no direction and zero distance.
     * If the swipe movement is below the threshold (`moveSize`), returns a cancel phase event with no direction and zero distance.
     */
    private getSwipeEvent(phase: SwipePhase, touchStartEvent: SwipeStartEvent | null, coordinates: SwipeCoordinates): SwipeEvent {
        if (!touchStartEvent) return { phase: phase, direction: null, distance: 0 };
        const distance: number = coordinates[this.swipeDirection[touchStartEvent!.direction] as "x" | "y"];

        if (!this.allMoves && Math.abs(distance) < this.moveSize) {
            return { phase: SwipePhase.cancel, direction: null, distance: 0 };
        }

        return {
            phase: phase,
            direction: touchStartEvent.direction,
            distance: distance,
        };
    }
}
