import { ActionConfig, LovelaceCardConfig } from "custom-card-helpers";
import { assign, boolean, enums, object, optional, string } from "superstruct";
import { actionConfigStruct } from "../../utils/action-struct";
import { baseLovelaceCardConfig } from "../../utils/editor-styles";
import { Info, INFOS } from "../../utils/info";
import { Layout, layoutStruct } from "../../utils/layout";

export interface EntityCardConfig extends LovelaceCardConfig {
    entity?: string;
    icon?: string;
    name?: string;
    icon_color?: string;
    hide_icon?: boolean;
    layout?: Layout;
    primary_info?: Info;
    secondary_info?: Info;
    tap_action?: ActionConfig;
    hold_action?: ActionConfig;
    double_tap_action?: ActionConfig;
}

export const entityCardConfigStruct = assign(
    baseLovelaceCardConfig,
    object({
        entity: optional(string()),
        icon: optional(string()),
        name: optional(string()),
        icon_color: optional(string()),
        hide_icon: optional(boolean()),
        layout: optional(layoutStruct),
        primary_info: optional(enums(INFOS)),
        secondary_info: optional(enums(INFOS)),
        tap_action: optional(actionConfigStruct),
        hold_action: optional(actionConfigStruct),
        double_tap_action: optional(actionConfigStruct),
    })
);
