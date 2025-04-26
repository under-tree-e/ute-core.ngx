/* Module imports */
import { Directive, ElementRef, Input } from "@angular/core";
import KeenSlider from "keen-slider";

/* Project imports */
import { SliderData, SliderDefault } from "../interfaces/slider";

@Directive({
    selector: "[uteSlider]",
    standalone: true,
})
export class SliderDirective {
    private readonly sliderItem: SliderData = { ...SliderDefault };

    @Input() public viewSlides: number = 1;
    @Input() public hideDots: boolean = false;

    constructor(private readonly elementRef: ElementRef) {}

    /**
     * Initializes the slider component after the view has been fully initialized.
     * It configures the slider container, adds the necessary classes for KeenSlider,
     * and optionally creates navigation dots if `hideDots` is false. Each dot is
     * clickable to navigate to the corresponding slide. If multiple slides are present,
     * the `slide` method is invoked to enable auto-sliding functionality.
     */
    ngAfterViewInit() {
        const sliderBlock = this.elementRef.nativeElement;
        const children: any = Array.from(sliderBlock.children);
        const sliderContainer = children[0];
        sliderContainer.classList.add("keen-slider");
        this.elementRef.nativeElement.style.overflow = "hidden";
        sliderContainer.style.display = "flex";
        const sliderChildren: any = Array.from(sliderContainer.children);
        sliderChildren.map((ch: any) => ch.classList.add("keen-slider__slide"));

        if (!this.hideDots) {
            const dotsContainer = document.createElement("div");
            dotsContainer.classList.add("dots");

            for (let i = 0; i < sliderChildren.length; i++) {
                const dot = document.createElement("button");
                dot.classList.add("dot");
                dot.title = "slider dot";
                if (i === 0) dot.classList.add("active");
                dot.addEventListener("click", () => {
                    this.sliderItem.slider.moveToIdx(i);
                });
                dotsContainer.appendChild(dot);
            }

            sliderBlock.appendChild(dotsContainer);
        }

        if (sliderChildren.length > 1) {
            this.slide();
        }
    }

    /**
     * Initializes the slider component.
     * It creates a new instance of the KeenSlider,
     * configures the slider to display the specified number of slides,
     * and optionally creates navigation dots.
     * It also adds an event listener to navigate to the next slide after 5 seconds.
     * The event listener is paused when the user hovers over the slider.
     * If the user starts dragging the slider, the event listener is cleared.
     * When the user stops dragging the slider, the event listener is restarted.
     * The event listener is also restarted when the slider is updated.
     */
    private slide() {
        this.sliderItem.slider = new KeenSlider(
            this.elementRef.nativeElement,
            {
                slides: {
                    perView: this.viewSlides,
                },
                initial: this.sliderItem.current,
                loop: true,
                /**
                 * The callback function for `slideChanged` event of the slider.
                 * It updates the current slide index and active dot.
                 * @param {Object} s The KeenSlider instance.
                 */
                slideChanged: (s) => {
                    this.sliderItem.current = s.track.details.rel;
                    const dots = this.elementRef.nativeElement.querySelectorAll(".dot");
                    dots.forEach((dot: any) => dot.classList.remove("active"));
                    dots[this.sliderItem.current].classList.add("active");
                },
            },
            [
                (slider) => {
                    let timeout: any = null;
                    let mouseOver = false;
                    /**
                     * Clears the timeout for the automatic slide transition.
                     * This function is used to prevent the slider from moving to the next slide
                     * automatically when certain events occur, such as when the user hovers over
                     * the slider or starts dragging it.
                     */
                    function clearNextTimeout() {
                        clearTimeout(timeout);
                    }
                    function nextTimeout() {
                        /**
                         * Sets a timeout to automatically transition to the next slide after 5 seconds.
                         * It clears any existing timeout and restarts the timer.
                         * If the user is currently hovering over the slider, the timer is not restarted.
                         */
                        clearTimeout(timeout);
                        if (mouseOver) return;
                        timeout = setTimeout(() => {
                            slider.next();
                        }, 5000);
                    }
                    slider.on("created", () => {
                        slider.container.addEventListener("mouseover", () => {
                            mouseOver = true;
                            clearNextTimeout();
                        });
                        slider.container.addEventListener("mouseout", () => {
                            mouseOver = false;
                            nextTimeout();
                        });
                        nextTimeout();
                    });
                    slider.on("dragStarted", clearNextTimeout);
                    slider.on("animationEnded", nextTimeout);
                    slider.on("updated", nextTimeout);
                },
            ]
        );
        this.sliderItem.dots = [...Array(this.sliderItem.slider.track.details.slides.length).keys()];
    }
}
