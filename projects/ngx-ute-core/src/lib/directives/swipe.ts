import { Directive, ElementRef, EventEmitter, HostBinding, Input, NgZone, OnDestroy, OnInit, Output } from "@angular/core";
import { fromEvent, merge, Observable, race, Subscription } from "rxjs";
import { elementAt, map, switchMap, takeUntil, tap } from "rxjs/operators";
import { SwipeCoordinates, SwipeDirection, SwipeDirectionConst, SwipeEvent, SwipePhase, SwipeScroll, SwipeStartEvent, SwipeSubscriptionConfig } from "../interfaces/swipe";

@Directive({
    selector: "[uteSwipe]",
    // standalone: true,
})
export class SwipeDirective implements OnInit, OnDestroy {
    @HostBinding("style.user-select") userSelect: string = "none";

    private subscriptions = new Subscription();
    private swipeDirection: typeof SwipeDirectionConst = SwipeDirectionConst;

    @Input() swipeAxis: SwipeScroll = SwipeScroll.both;
    @Input() touchEndTrigger: boolean = true;
    @Output() swipe: EventEmitter<SwipeEvent> = new EventEmitter<SwipeEvent>();

    constructor(private elementRef: ElementRef, private ngZone: NgZone) {}

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

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

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

    private getDistance(startCoordinates: SwipeCoordinates, moveCoordinates: SwipeCoordinates): SwipeCoordinates {
        return {
            x: moveCoordinates.x - startCoordinates.x,
            y: moveCoordinates.y - startCoordinates.y,
        };
    }

    private getDirection(startCoordinates: SwipeCoordinates, moveCoordinates: SwipeCoordinates): SwipeDirection {
        const { x, y } = this.getDistance(startCoordinates, moveCoordinates);
        if ((Math.abs(x) < Math.abs(y) && this.swipeAxis === SwipeScroll.both) || this.swipeAxis === SwipeScroll.vertical) {
            return Math.abs(startCoordinates.y) < Math.abs(moveCoordinates.y) ? SwipeDirection.down : SwipeDirection.up;
        } else {
            return Math.abs(startCoordinates.x) < Math.abs(moveCoordinates.x) ? SwipeDirection.right : SwipeDirection.left;
        }
    }

    private getSwipeEvent(phase: SwipePhase, touchStartEvent: SwipeStartEvent | null, coordinates: SwipeCoordinates): SwipeEvent {
        return {
            phase: phase,
            direction: touchStartEvent ? touchStartEvent.direction : null,
            distance: touchStartEvent ? coordinates[this.swipeDirection[touchStartEvent.direction] as "x" | "y"] : 0,
        };
    }
}
