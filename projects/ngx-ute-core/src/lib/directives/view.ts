import { afterNextRender, Directive, ElementRef, EventEmitter, HostListener, Input, NgZone, OnDestroy, OnInit, Optional, Output, Renderer2 } from "@angular/core";
import { config, Subscription } from "rxjs";
import { IntersectionView } from "../interfaces/view";

@Directive({
    selector: "[uteView]",
    standalone: true,
})
export class ViewDirective implements OnInit, OnDestroy {
    private elementStage: number = 0;
    private entry: any = null;
    private baseDiff: number = 0;

    @Input() public viewClass: string = "";
    @Input() public leaveClass: string = "";
    @Input() public useScroll: boolean = false;
    @Input() public viewPercent: number = 0;
    @Input() public useVariable: string = "view";

    @Output() public callback: EventEmitter<any> = new EventEmitter<any>();

    private subscriptions = new Subscription();

    constructor(private elementRef: ElementRef, private ngZone: NgZone) {
        afterNextRender(() => {
            if ("IntersectionObserver" in window) {
                let options: IntersectionObserverInit = {
                    root: null,
                    threshold: this.viewPercent / 100,
                    rootMargin: "0px",
                };
                // if (this.useScroll) {
                //     options.threshold = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
                // }
                const observer: IntersectionObserver = new IntersectionObserver((entries, _) => {
                    entries.forEach((entry) => {
                        this.entry = entry;

                        this.handleIntersection(entry.isIntersecting);
                    });
                }, options);
                observer.observe(this.elementRef.nativeElement);
                return;
            }
        });
    }

    ngOnInit() {
        // this.ngZone.runOutsideAngular(() => {
        //     this.subscriptions.add(
        //     );
        // });
    }

    @HostListener("window:scroll", ["$event"])
    private onScroll(event: Event) {
        // console.log(this.useVariable);

        let top: number = this.entry.target.offsetTop;
        let scroll: number = (event.target as Document).documentElement.scrollTop;
        const diff = top - scroll;
        if (this.elementStage === 1) {
            this.baseDiff = diff;
            this.elementStage = 2;
        } else if (this.elementStage === 2) {
            const percentage = Math.round(Math.max(0, Math.min(100, 100 - (diff / this.baseDiff) * 100))) / 100;
            console.log(this.useVariable, percentage);
            console.log(this.baseDiff);
            console.log(diff);

            this.elementRef.nativeElement.style.setProperty(`--${this.useVariable}`, percentage);
        }
    }

    private handleIntersection(intersect: boolean): void {
        console.log(intersect);
        if (intersect) {
            this.elementStage = 1;
            if (this.viewClass) {
                this.elementRef.nativeElement.classList.addClass(this.viewClass);
            }
        } else {
            this.elementStage = 0;
            this.baseDiff = 0;
            if (this.leaveClass) {
                this.elementRef.nativeElement.classList.addClass(this.leaveClass);
            }
            if (this.viewClass) {
                this.elementRef.nativeElement.classList.removeClass(this.viewClass);
            }
        }
        this.callback.emit({ element: this.elementRef, intersect: intersect });
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }
}
