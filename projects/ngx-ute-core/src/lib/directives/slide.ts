import { Directive, ElementRef, Input } from "@angular/core";
import { SliderData, SliderDefault } from "../interfaces/slider";
import KeenSlider from "keen-slider";

@Directive({
    selector: "[uteSlider]",
    standalone: true,
})
export class SliderDirective {
    private readonly sliderItem: SliderData = { ...SliderDefault };

    @Input() public viewSlides: number = 1;
    @Input() public hideDots: boolean = false;

    constructor(private readonly elementRef: ElementRef) {}

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

    private slide() {
        this.sliderItem.slider = new KeenSlider(
            this.elementRef.nativeElement,
            {
                slides: {
                    perView: this.viewSlides,
                },
                initial: this.sliderItem.current,
                loop: true,
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
                    function clearNextTimeout() {
                        clearTimeout(timeout);
                    }
                    function nextTimeout() {
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
