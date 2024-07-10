export interface SwipeCoordinates {
    x: number;
    y: number;
}

export enum SwipeDirection {
    "up" = "up",
    "down" = "down",
    "left" = "left",
    "right" = "right",
}

export enum SwipeScroll {
    "vertical" = "vertical",
    "horizontal" = "horizontal",
    "both" = "both",
}

export const SwipeDirectionConst = {
    up: "y",
    down: "y",
    left: "x",
    right: "x",
};

export enum SwipePhase {
    "start" = "start",
    "move" = "move",
    "end" = "end",
    "cancel" = "cancel",
}

export interface SwipeStartEvent {
    x: number;
    y: number;
    direction: SwipeDirection;
}

/**
 * Ute Swipe Event
 * @prop {@link SwipeEvent.phase | phase}: `SwipePhase` - Event phase
 * @prop {@link SwipeEvent.direction | direction}: `SwipeDirection | null` - Event direction, only `move` phase
 * @prop {@link SwipeEvent.distance | distance}: `number` - Distance of move in px
 */
export interface SwipeEvent {
    /**
     * Event phase
     * @prop {@link SwipePhase.start | start}: string
     * @prop {@link SwipePhase.move | move}: string
     * @prop {@link SwipePhase.end | end}: string
     * @prop {@link SwipePhase.cancel | cancel}: string
     */
    phase: SwipePhase;
    /**
     * Event direction, only `move` phase
     */
    direction: SwipeDirection | null;
    /**
     * Distance of move in px
     */
    distance: number;
}

export interface SwipeSubscriptionConfig {
    domElement: HTMLElement;
    onSwipe?: (event: SwipeEvent) => void;
}
