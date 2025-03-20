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
