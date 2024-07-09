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

export interface SwipeEvent {
    phase: SwipePhase;
    direction: SwipeDirection | null;
    distance: number;
}

export interface SwipeSubscriptionConfig {
    domElement: HTMLElement;
    onSwipe?: (event: SwipeEvent) => void;
}
