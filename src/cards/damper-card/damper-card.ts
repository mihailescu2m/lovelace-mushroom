import { css, CSSResultGroup, html, PropertyValues, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import {
    actionHandler,
    ActionHandlerEvent,
    computeRTL,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    isActive,
    isAvailable,
    LovelaceCard,
    LovelaceCardEditor,
} from "../../ha";
import "../../shared/badge-icon";
import "../../shared/button";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { MushroomBaseElement } from "../../utils/base-element";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { stateIcon } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
import { DAMPER_CARD_EDITOR_NAME, DAMPER_CARD_NAME, DAMPER_ENTITY_DOMAINS } from "./const";
import "./controls/damper-itc-control";
import "./controls/damper-percentage-control";
import { DamperCardConfig } from "./damper-card-config";
import { getPercentage, getTargetTemp, getCurrentTemp } from "./utils";

registerCustomCard({
    type: DAMPER_CARD_NAME,
    name: "Mushroom Damper A/C Card",
    description: "Card for A/C damper entity",
});

@customElement(DAMPER_CARD_NAME)
export class DamperCard extends MushroomBaseElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./damper-card-editor");
        return document.createElement(DAMPER_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<DamperCardConfig> {
        const entities = Object.keys(hass.states);
        const dampers = entities.filter((e) => DAMPER_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${DAMPER_CARD_NAME}`,
            entity: dampers[0],
        };
    }

    @state() private _config?: DamperCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: DamperCardConfig): void {
        this._config = {
            tap_action: {
                action: "toggle",
            },
            hold_action: {
                action: "more-info",
            },
            ...config,
        };
        this.updatePercentage();
    }

    protected updated(changedProperties: PropertyValues) {
        super.updated(changedProperties);
        if (this.hass && changedProperties.has("hass")) {
            this.updatePercentage();
        }
    }

    @state()
    private percentage?: number;

    updatePercentage() {
        this.percentage = undefined;
        if (!this._config || !this.hass || !this._config.entity) return;

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];

        if (!entity) return;
        this.percentage = getPercentage(entity);
    }

    private onCurrentPercentageChange(e: CustomEvent<{ value?: number }>): void {
        if (e.detail.value != null) {
            this.percentage = Math.round(e.detail.value);
        }
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entity_id = this._config.entity;
        const entity = this.hass.states[entity_id];
        var climate_entity;

        const name = this._config.name || entity.attributes.friendly_name;
        const layout = getLayoutFromConfig(this._config);
        const hideState = this._config.hide_state;

        let icon = "mdi:air-conditioner";
        let iconStyle = {};
        let iconColor = "green";

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);
        let stateValue = `${stateDisplay}`;
        const active = isActive(entity);

        if (this._config.climate_entity) {
            const climate_entity_id = this._config.climate_entity;
            climate_entity = this.hass.states[climate_entity_id];
            if (climate_entity) {
                const temperature = getCurrentTemp(climate_entity);
                const climateState = computeStateDisplay(this.hass.localize, climate_entity, this.hass.locale).toLowerCase();
                if (stateDisplay === "Off") {
                    icon = "mdi:power";
                    iconColor = "#8a8a8a";
                } else if (climateState === "heating") {
                    icon = "mdi:fire";
                    iconColor = "#ff8100";
                } else if (climateState === "cooling") {
                    icon = "mdi:snowflake";
                    iconColor = "#2b9af9";
                } else if (climateState === "auto") {
                    icon = "mdi:autorenew";
                    iconColor = "green";
                } else if (climateState === "drying") {
                    icon = "mdi:water-percent";
                    iconColor = "#efbd07";
                } else if (climateState === "fan") {
                    icon = "mdi:fan";
                    iconColor = "#8a8a8a";
                } else if (climateState === "idle") {
                    icon = "mdi:power";
                    iconColor = "#8a8a8a";
                } else {
                    icon = "mdi:air-conditioner";
                }
            	const iconRgbColor = computeRgbColor(iconColor);
            	iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
            	iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;

                stateValue = `${temperature}°C`;
                if (!this.percentage && active) {
                  const target = getTargetTemp(climate_entity);
                  stateValue += ` |-> ${target}°C`;
                }
            }
        }

        if (this.percentage) {
            stateValue += ` | ${this.percentage}%`;
        }

        const rtl = computeRTL(this.hass);

        const displayControls =
            (!this._config.collapsible_controls || active) &&
            (this._config.show_percentage_control || this._config.show_itc_control);

        return html`
            <ha-card class=${classMap({ "fill-container": this._config.fill_container ?? false })}>
                <mushroom-card .layout=${layout} ?rtl=${rtl}>
                    <mushroom-state-item
                        ?rtl=${rtl}
                        .layout=${layout}
                        @action=${this._handleAction}
                        .actionHandler=${actionHandler({
                            hasHold: hasAction(this._config.hold_action),
                            hasDoubleClick: hasAction(this._config.double_tap_action),
                        })}
                    >
                        <mushroom-shape-icon
                            slot="icon"
                            style=${styleMap(iconStyle)}
                            .disabled=${!active}
                            .icon=${icon}
                        ></mushroom-shape-icon>
                        ${!isAvailable(entity)
                            ? html`
                                  <mushroom-badge-icon
                                      class="unavailable"
                                      slot="badge"
                                      icon="mdi:help"
                                  ></mushroom-badge-icon>
                              `
                            : null}
                        <mushroom-state-info
                            slot="info"
                            .primary=${name}
                            .secondary=${!hideState && stateValue}
                        ></mushroom-state-info>
                    </mushroom-state-item>
                    ${displayControls
                        ? html`
                              <div class="actions" ?rtl=${rtl}>
                                  ${this._config.show_percentage_control
                                      ? html`
                                            <mushroom-damper-percentage-control
                                                .hass=${this.hass}
                                                .entity=${entity}
                                                @current-change=${this.onCurrentPercentageChange}
                                            ></mushroom-damper-percentage-control>
                                        `
                                      : null}
                                  ${this._config.show_itc_control
                                      ? html`
                                            <mushroom-damper-itc-control
                                                .hass=${this.hass}
                                                .entity=${entity}
                                                .climate_entity=${climate_entity}
                                            ></mushroom-damper-itc-control>
                                        `
                                      : null}
                              </div>
                          `
                        : null}
                </mushroom-card>
            </ha-card>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            super.styles,
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-shape-icon ha-icon {
                    color: red !important;
                }
                mushroom-damper-percentage-control {
                    flex: 1;
                }
            `,
        ];
    }
}
