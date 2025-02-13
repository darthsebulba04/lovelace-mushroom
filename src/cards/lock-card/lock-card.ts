import {
    ActionHandlerEvent,
    computeRTL,
    computeStateDisplay,
    handleAction,
    hasAction,
    HomeAssistant,
    LovelaceCard,
    LovelaceCardEditor,
} from "custom-card-helpers";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { isActive, isAvailable } from "../../ha/data/entity";
import { LOCK_ENTITY_DOMAINS } from "../../ha/data/lock";
import "../../shared/badge-icon";
import "../../shared/card";
import "../../shared/shape-icon";
import "../../shared/state-info";
import "../../shared/state-item";
import { cardStyle } from "../../utils/card-styles";
import { computeRgbColor } from "../../utils/colors";
import { registerCustomCard } from "../../utils/custom-cards";
import { actionHandler } from "../../utils/directives/action-handler-directive";
import { stateIcon } from "../../utils/icons/state-icon";
import { getLayoutFromConfig } from "../../utils/layout";
import { LOCK_CARD_EDITOR_NAME, LOCK_CARD_NAME } from "./const";
import { LockCardConfig } from "./lock-card-config";
import "./controls/lock-buttons-control";

registerCustomCard({
    type: LOCK_CARD_NAME,
    name: "Mushroom Lock Card",
    description: "Card for all lock entities",
});

@customElement(LOCK_CARD_NAME)
export class LockCard extends LitElement implements LovelaceCard {
    public static async getConfigElement(): Promise<LovelaceCardEditor> {
        await import("./lock-card-editor");
        return document.createElement(LOCK_CARD_EDITOR_NAME) as LovelaceCardEditor;
    }

    public static async getStubConfig(hass: HomeAssistant): Promise<LockCardConfig> {
        const entities = Object.keys(hass.states);
        const locks = entities.filter((e) => LOCK_ENTITY_DOMAINS.includes(e.split(".")[0]));
        return {
            type: `custom:${LOCK_CARD_NAME}`,
            entity: locks[0],
        };
    }

    @property({ attribute: false }) public hass!: HomeAssistant;

    @state() private _config?: LockCardConfig;

    getCardSize(): number | Promise<number> {
        return 1;
    }

    setConfig(config: LockCardConfig): void {
        this._config = {
            tap_action: {
                action: "more-info",
            },
            hold_action: {
                action: "more-info",
            },
            double_tap_action: {
                action: "more-info",
            },
            ...config,
        };
    }

    private _handleAction(ev: ActionHandlerEvent) {
        handleAction(this, this.hass!, this._config!, ev.detail.action!);
    }

    protected render(): TemplateResult {
        if (!this._config || !this.hass || !this._config.entity) {
            return html``;
        }

        const entityId = this._config.entity;
        const entity = this.hass.states[entityId];

        const name = this._config.name || entity.attributes.friendly_name || "";
        const icon = this._config.icon || stateIcon(entity);
        const hideState = this._config.hide_state;
        const layout = getLayoutFromConfig(this._config);

        const stateDisplay = computeStateDisplay(this.hass.localize, entity, this.hass.locale);

        const iconColor = this._config.icon_color;

        const rtl = computeRTL(this.hass);

        return html`
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
                    ${this.renderIcon(icon, iconColor, isActive(entity))}
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
                        .secondary=${!hideState && stateDisplay}
                    ></mushroom-state-info>
                </mushroom-state-item>
                <div class="actions" ?rtl=${rtl}>
                    <mushroom-lock-buttons-control
                        .hass=${this.hass}
                        .entity=${entity}
                        .fill=${layout !== "horizontal"}
                    >
                    </mushroom-lock-buttons-control>
                </div>
            </mushroom-card>
        `;
    }

    renderIcon(icon: string, iconColor: string | undefined, active: boolean): TemplateResult {
        const iconStyle = {
            "--icon-color": "rgb(var(--rgb-state-lock))",
            "--shape-color": "rgba(var(--rgb-state-lock), 0.2)",
        };
        if (iconColor) {
            const iconRgbColor = computeRgbColor(iconColor);
            iconStyle["--icon-color"] = `rgb(${iconRgbColor})`;
            iconStyle["--shape-color"] = `rgba(${iconRgbColor}, 0.2)`;
        }
        return html`
            <mushroom-shape-icon
                slot="icon"
                .disabled=${!active}
                .icon=${icon}
                style=${styleMap(iconStyle)}
            ></mushroom-shape-icon>
        `;
    }

    static get styles(): CSSResultGroup {
        return [
            cardStyle,
            css`
                mushroom-state-item {
                    cursor: pointer;
                }
                mushroom-lock-buttons-control {
                    flex: 1;
                }
            `,
        ];
    }
}
