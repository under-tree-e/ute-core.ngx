export interface UteFontSizes {
    /**
     * Mobile: w `< 640 Port`
     */
    mob: number;
    /**
     * Pad Small: w `< 1100 Albm` or `w < 900 Port`
     */
    pas: number;
    /**
     * Pad: w `< 1100 Port`
     */
    pad: number;
    /**
     * HD: w `< 1300 Albm`
     */
    hd: number;
    /**
     * Full HD + Wide: w `< 2000 Albm` or h `< 1100` + w `< 3000 Port`
     */
    fhd: number;
    /**
     * 2K + Wide: w `< 2600 Albm` or h `< 1500` + w `< 3500 Port`
     */
    two: number;
    /**
     * 4K + Wide: w `< 4000 Albm` or h `< 2200` + w `< 5200 Port`
     */
    four: number;
    /**
     * Else
     */
    else: number;
}
