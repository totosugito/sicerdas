import type { BaseResponse } from "backend/src/types/index.ts";
import type {
    TierItem,
    CreateTierParams,
    UpdateTierParams,
} from "backend/src/modules/tier/index.ts";

export type { TierItem, CreateTierParams, UpdateTierParams, BaseResponse };

export interface TierResponse<T = TierItem> extends BaseResponse {
    data: T;
}
