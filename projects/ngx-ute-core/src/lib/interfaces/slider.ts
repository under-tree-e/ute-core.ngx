import { KeenSliderInstance } from "keen-slider";

export interface SliderData {
    slider: KeenSliderInstance;
    list: any[];
    dots: number[];
    current: number;
}

export const SliderDefault: SliderData = {
    slider: {} as KeenSliderInstance,
    list: [],
    dots: [],
    current: 0,
};
