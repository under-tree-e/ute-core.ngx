import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { ControlData } from "../interfaces/control";

@Injectable({
    providedIn: "root",
})
export class ControlService {
    private controlSubject = new Subject<any>();
    public subscriber = this.controlSubject.asObservable();

    /**
     * Send message to all subscribers
     * @param type - Name (ID) of message
     * @param value - Data (content) to send
     */
    public request(type: string, value?: any) {
        const data: ControlData = { type: type, data: value };
        this.controlSubject.next(data);
    }
}
