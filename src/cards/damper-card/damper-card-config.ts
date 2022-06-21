import { assign, boolean, object, optional } from "superstruct";
import { actionsSharedConfigStruct, ActionsSharedConfig } from "../../shared/config/actions-config";
import { layoutSharedConfigStruct, LayoutSharedConfig } from "../../shared/config/layout-config";
import { entitySharedConfigStruct, EntitySharedConfig } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { LovelaceCardConfig } from "../../ha";

export type DamperCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    LayoutSharedConfig &
    ActionsSharedConfig & {
        hide_state?: boolean;
        icon_animation?: boolean;
        show_percentage_control?: boolean;
        show_itc_control?: boolean;
        collapsible_controls?: boolean;
    };

export const damperCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, layoutSharedConfigStruct, actionsSharedConfigStruct),
    object({
        hide_state: optional(boolean()),
        icon_animation: optional(boolean()),
        show_percentage_control: optional(boolean()),
        show_itc_control: optional(boolean()),
        collapsible_controls: optional(boolean()),
    })
);
