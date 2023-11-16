import { Inject, Injectable } from "@angular/core";
import { UteModuleConfigs } from "../interfaces/config";

@Injectable()
export class PreloadService {
    private defaultConfig: UteModuleConfigs = {
        version: "0.0.1",
    };
    private defaultTemplate: string = "";
    constructor(@Inject("config") private config: UteModuleConfigs) {
        this.defaultTemplate = `
		<div class="preload default none" id="preload">
			<div class="back">
				${this.config.version ? `<div class="version" id="preload-vers">v${this.config.version}</div>` : ""}
				${this.config.year ? `<div class="year" id="preload-year">${this.config.year}</div>` : ""}
			</div>
			<div class="front">
				<img class="logo" src="#" />
				<div class="status" id="preload-status">Init</div>
				<div class="line"></div>
				<img class="company" src="#" />
			</div>
		</div>`;

        this.ganerateHTML();
    }

    private ganerateHTML() {
        let htmlTemplate: Element = {} as Element;
        htmlTemplate.innerHTML = this.config.template || this.defaultTemplate;
        document.body.appendChild(htmlTemplate);
    }
}
