import { fireEvent, HomeAssistant } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import setupCustomlocalize from "../../../localize";
import { configElementStyle } from "../../../utils/editor-styles";
import { GENERIC_FIELDS } from "../../../utils/form/fields";
import { HaFormSchema } from "../../../utils/form/ha-form";
import { computeChipEditorComponentName } from "../../../utils/lovelace/chip/chip-element";
import { TemplateChipConfig } from "../../../utils/lovelace/chip/types";
import { LovelaceChipEditor } from "../../../utils/lovelace/types";
import { TEMPLATE_FIELDS } from "../../template-card/template-card-editor";

const SCHEMA: HaFormSchema[] = [
    { name: "entity", selector: { entity: {} } },
    { name: "icon", selector: { text: { multiline: true } } },
    { name: "icon_color", selector: { text: { multiline: true } } },
    { name: "content", selector: { text: { multiline: true } } },
    { name: "tap_action", selector: { "mush-action": {} } },
    { name: "hold_action", selector: { "mush-action": {} } },
    { name: "double_tap_action", selector: { "mush-action": {} } },
];

@customElement(computeChipEditorComponentName("template"))
export class EntityChipEditor extends LitElement implements LovelaceChipEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: TemplateChipConfig;

    public setConfig(config: TemplateChipConfig): void {
        this._config = config;
    }

    private _computeLabelCallback = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (schema.name === "entity") {
            return `${this.hass!.localize(
                "ui.panel.lovelace.editor.card.generic.entity"
            )} (${customLocalize("editor.card.template.entity_extra")})`;
        }
        if (GENERIC_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (TEMPLATE_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.template.${schema.name}`);
        }
        return this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    };

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${SCHEMA}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }

    static get styles(): CSSResultGroup {
        return configElementStyle;
    }
}
