import { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { HomeAssistant, isActive } from "../../../ha";
import "../../../shared/slider";
import { isITCMode } from "../utils";

@customElement("mushroom-damper-itc-control")
export class DamperPercentageControl extends LitElement {
    @property({ attribute: false }) public hass!: HomeAssistant;

    @property({ attribute: false }) public entity!: HassEntity;

    @property({ attribute: false }) public climate_entity!: HassEntity;

    private _onTap(e: MouseEvent): void {
        e.stopPropagation();
        const mode = isITCMode(this.entity) ? "Damper" : "ITC";

        this.hass.callService("fan", "set_preset_mode", {
            entity_id: this.entity.entity_id,
            preset_mode: mode,
        });
    }

    protected render(): TemplateResult {
        const itc = isITCMode(this.entity);
        const active = isActive(this.entity);
        var icon = "mdi:air-filter";
        if (itc) {
          icon = "mdi:thermometer";
        }

        return html`
            <mushroom-button
                class=${classMap({ active: itc })}
                .icon=${icon}
                @click=${this._onTap}
                .disabled=${!active || !this.climate_entity}
            />
        `;
    }

    static get styles(): CSSResultGroup {
        return css`
            :host {
                display: flex;
            }
            mushroom-button.active {
                --icon-color: rgb(var(--rgb-white));
                --bg-color: rgb(var(--rgb-state-fan));
            }
        `;
    }
}
