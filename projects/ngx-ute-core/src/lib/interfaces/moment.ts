export interface UteProvidersData {
    fullDateTime: DateFormat;
    shortDateTime: DateFormat;
    fullDate: DateFormat;
    shortDate: DateFormat;
}

export interface DateFormat {
    parse: {
        dateInput: string;
    };
    display: {
        dateInput: string;
        monthYearLabel: string;
        dateA11yLabel: string;
        monthYearA11yLabel: string;
    };
}
