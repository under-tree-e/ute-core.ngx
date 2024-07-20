import { HostListener, Injectable } from "@angular/core";
import { UteFontSizes } from "../interfaces/font-sizes";

/**
 * Default Font to Screen sizes:
 *
 * - w `< 640 Port` => *Mobile:* 16px
 * - w `< 1100 Albm` or `w < 900 Port` => *Pad Small:* 20px
 * - w `< 1100 Port` => *Pad:* 30px
 * - w `< 1300 Albm` => *HD:* 20px
 * - w `< 2000 Albm` or h `< 1100` + w `< 3000 Port` => *Full HD + Wide:* 30px
 * - w `< 2600 Albm` or h `< 1500` + w `< 3500 Port` => *2K + Wide:* 35px
 * - w `< 4000 Albm` or h `< 2200` + w `< 5200 Port` => *4K + Wide:* 45px
 * - else => *Else:* 60px
 *
 */
@Injectable({
    providedIn: "root",
})
export class ResizeService {
    //<800 t -
    //<1200 f -
    //=====
    //<800 f 16px
    //800 t 8px
    //900 t 10px
    //1000 t 12px
    //1280 t 12px
    //1920 t 16px
    //2560 t 20px
    //3840 t 30px
    private defaultSizes: UteFontSizes = {
        mob: 16,
        pas: 10,
        pad: 12,
        hd: 12,
        fhd: 14,
        two: 20,
        four: 30,
        else: 34,
    };
    private fontSizes: UteFontSizes = this.defaultSizes;
    private preSize: number = 16;
    private currentSize: number = 16;

    public Init(customSizes?: UteFontSizes) {
        if (customSizes) {
            this.fontSizes = customSizes;
        }
        window.addEventListener("resize", () => {
            this.onResize();
        });
        this.onResize();
    }

    @HostListener("window:resize", ["$event"])
    public onResize() {
        let orientation: boolean = true;
        let width: number = window.screen.width;
        let height: number = window.screen.height;

        if (window.matchMedia("(orientation: portrait)").matches) {
            orientation = false;
        }

        console.log(width, orientation);

        if (width < 800 && !orientation) {
            this.currentSize = this.fontSizes.mob;
        } else if ((width < 1100 && orientation) || (width < 900 && !orientation)) {
            this.currentSize = this.fontSizes.pas;
        } else if (width < 1100 && !orientation) {
            this.currentSize = this.fontSizes.pad;
        } else if (width < 1300 && orientation) {
            this.currentSize = this.fontSizes.hd;
        } else if ((width < 2000 && orientation) || (height < 1100 && width < 3000)) {
            this.currentSize = this.fontSizes.fhd;
        } else if ((width < 2600 && orientation) || (height < 1500 && width < 3500)) {
            this.currentSize = this.fontSizes.two;
        } else if ((width < 4000 && orientation) || (height < 2200 && width < 5200)) {
            this.currentSize = this.fontSizes.four;
        } else {
            this.currentSize = this.fontSizes.else;
        }

        if (this.preSize != this.currentSize) {
            this.preSize = this.currentSize;
            document.documentElement.style.fontSize = `${this.currentSize}px`;
        }
    }
}
