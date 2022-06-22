import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import memoizeOne from "memoize-one";
import { assert } from "superstruct";
import { fireEvent, LovelaceCardEditor } from "../../ha";
import setupCustomlocalize from "../../localize";
import { MushroomBaseElement } from "../../utils/base-element";
import { GENERIC_LABELS } from "../../utils/form/generic-fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { stateIcon } from "../../utils/icons/state-icon";
import { loadHaComponents } from "../../utils/loader";
import { DAMPER_CARD_EDITOR_NAME, DAMPER_ENTITY_DOMAINS } from "./const";
import { DamperCardConfig, damperCardConfigStruct } from "./damper-card-config";

const DAMPER_LABELS = ["climate_entity", "show_percentage_control", "show_itc_control"];

const computeSchema = memoizeOne((): HaFormSchema[] => [
    { name: "entity", selector: { entity: { domain: DAMPER_ENTITY_DOMAINS } } },
    { name: "climate_entity", selector: { entity: { domain: "climate" } } },
    { name: "name", selector: { text: {} } },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "layout", selector: { "mush-layout": {} } },
            { name: "fill_container", selector: { boolean: {} } },
            { name: "hide_state", selector: { boolean: {} } },
            { name: "collapsible_controls", selector: { boolean: {} } },
        ],
    },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "show_percentage_control", selector: { boolean: {} } },
            { name: "show_itc_control", selector: { boolean: {} } },
        ],
    },
    { name: "tap_action", selector: { "mush-action": {} } },
    { name: "hold_action", selector: { "mush-action": {} } },
    { name: "double_tap_action", selector: { "mush-action": {} } },
]);

@customElement(DAMPER_CARD_EDITOR_NAME)
export class DamperCardEditor extends MushroomBaseElement implements LovelaceCardEditor {
    @state() private _config?: DamperCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: DamperCardConfig): void {
        assert(config, damperCardConfigStruct);
        this._config = config;
    }

    private _computeLabel = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (GENERIC_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (DAMPER_LABELS.includes(schema.name)) {
            return customLocalize(`editor.card.damper.${schema.name}`);
        }
        return this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    };

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        const schema = computeSchema();

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${schema}
                .computeLabel=${this._computeLabel}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }
}
