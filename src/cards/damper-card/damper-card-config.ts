import { assign, boolean, object, optional, string } from "superstruct";
import { actionsSharedConfigStruct, ActionsSharedConfig } from "../../shared/config/actions-config";
import { layoutSharedConfigStruct, LayoutSharedConfig } from "../../shared/config/layout-config";
import { entitySharedConfigStruct, EntitySharedConfig } from "../../shared/config/entity-config";
import { lovelaceCardConfigStruct } from "../../shared/config/lovelace-card-config";
import { LovelaceCardConfig } from "../../ha";

export type DamperCardConfig = LovelaceCardConfig &
    EntitySharedConfig &
    LayoutSharedConfig &
    ActionsSharedConfig & {
        climate_entity?: string;
        hide_state?: boolean;
        show_percentage_control?: boolean;
        show_itc_control?: boolean;
        collapsible_controls?: boolean;
    };

export const damperCardConfigStruct = assign(
    lovelaceCardConfigStruct,
    assign(entitySharedConfigStruct, layoutSharedConfigStruct, actionsSharedConfigStruct),
    object({
        climate_entity: optional(string()),
        hide_state: optional(boolean()),
        show_percentage_control: optional(boolean()),
        show_itc_control: optional(boolean()),
        collapsible_controls: optional(boolean()),
    })
);
