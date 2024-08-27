import { ElementRef } from "@angular/core";

export interface IntersectionView {
    intersect: boolean;
    element: ElementRef<any>;
}
