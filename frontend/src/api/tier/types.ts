import type { BaseResponse } from "@/api/types";

export interface TierLimits {
  chatAi?: {
    daily_messages?: number;
    max_tokens?: number;
  };
}

export interface TierItem {
  slug: string;
  name: string;
  price: string;
  currency: string;
  billingCycle: string;
  features: string[];
  limits: TierLimits;
  isActive: boolean;
  sortOrder: number;
  isPopular: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTierParams {
  slug: string;
  name: string;
  price: string;
  currency?: string;
  billingCycle?: string;
  features?: string[];
  limits?: TierLimits;
  isActive?: boolean;
  sortOrder?: number;
  isPopular?: boolean;
}

export type UpdateTierParams = Partial<Omit<CreateTierParams, "slug">>;

export type { BaseResponse };

export interface TierResponse<T = TierItem> extends BaseResponse {
  data: T;
}
