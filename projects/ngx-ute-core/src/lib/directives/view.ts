/* Module imports */
import { afterNextRender, Directive, ElementRef, EventEmitter, HostListener, Input, Output } from "@angular/core";

@Directive({
    selector: "[uteView]",
    standalone: true,
})
export class ViewDirective {
    private readonly percent: number = -1;

    @Input() public viewClass: string = "view";
    @Input() public leaveClass: string = "";
    @Input() public useScroll: boolean = false;
    @Input() public viewPercent: number = 0;
    @Input() public useVariable: string = "view";
    @Input() public invertScroll: boolean = false;
    @Input() public heightPercent: number = 100;

    @Output() public callback: EventEmitter<any> = new EventEmitter<any>();

    /**
     * @description
     *
     * Constructor of the ViewDirective directive.
     *
     * The constructor creates an IntersectionObserver instance, which is used to detect when the
     * element is scrolled into view. The observer is set up to trigger the callback when the element
     * is at least `viewPercent` of the viewport visible.
     *
     * @param elementRef The ElementRef of the element the directive is applied to.
     */
    constructor(private readonly elementRef: ElementRef) {
        afterNextRender(() => {
            if ("IntersectionObserver" in window && !this.useScroll) {
                let options: IntersectionObserverInit = {
                    root: null,
                    threshold: this.viewPercent / 100,
                    rootMargin: "0px",
                };
                const observer: IntersectionObserver = new IntersectionObserver((entries, _) => {
                    entries.forEach((entry) => {
                        this.handleIntersection(entry.isIntersecting);
                    });
                }, options);
                observer.observe(this.elementRef.nativeElement);
            }
        });
    }

    @HostListener("window:scroll", ["$event"])
    /**
     * Handles the window scroll event.
     *
     * The method checks if the directive is configured to use the scroll event.
     * If so, it calculates the percentage of the element that is currently visible
     * in the viewport and sets the CSS variable `--view` to that percentage.
     *
     * The calculation is done as follows:
     * - If `invertScroll` is true, the method calculates the percentage by subtracting
     *   the top position of the element from the height of the viewport, and then
     *   dividing the result by the height of the element.
     * - If `invertScroll` is false, the method calculates the percentage by dividing
     *   the top position of the element by its height.
     *
     * @param event The window scroll event.
     */
    private onScroll(event: Event) {
        if (this.useScroll) {
            let height: number = document.documentElement.clientHeight;
            let elementHeight: number = this.elementRef.nativeElement.getBoundingClientRect().height;
            let top: number = this.elementRef.nativeElement.getBoundingClientRect().top - height;
            let percentage: number = 0;
            if (this.invertScroll) {
                percentage = Math.max(0, Math.min(1, 1 - (top * -1 - elementHeight) / (height * (this.heightPercent / 100))));
            } else {
                percentage = Math.max(
                    0,
                    Math.min(
                        1,

                        Math.round(((top * -1) / elementHeight) * 100) / 100
                    )
                );
            }
            if (this.percent !== percentage) {
                this.elementRef.nativeElement.style.setProperty(`--${this.useVariable}`, percentage);
            }
        }
    }

    /**
     * Handles the intersection event.
     *
     * The method adds or removes the specified CSS classes from the element based on whether
     * it is currently visible in the viewport.
     *
     * @param intersect A boolean indicating whether the element is currently visible in the viewport.
     */
    private handleIntersection(intersect: boolean): void {
        if (intersect) {
            if (this.viewClass) {
                this.elementRef.nativeElement.classList.add(this.viewClass);
            }
        } else {
            if (this.leaveClass) {
                this.elementRef.nativeElement.classList.add(this.leaveClass);
            }
            if (this.viewClass) {
                this.elementRef.nativeElement.classList.remove(this.viewClass);
            }
        }
        this.callback.emit({ element: this.elementRef, intersect: intersect });
    }
}
