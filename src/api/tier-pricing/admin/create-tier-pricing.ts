import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { TierPricing } from "../types";

export type CreateTierPricingRequest = {
    slug: string;
    name: string;
    price: string;
    currency?: string;
    billingCycle?: string;
    features?: string[];
    limits?: Record<string, unknown>;
    isActive?: boolean;
    sortOrder?: number;
    isPopular?: boolean;
};

export type CreateTierPricingResponse = {
    success: boolean;
    message: string;
    data: TierPricing;
};

export const useCreateTierPricing = () => {
    return useMutation({
        mutationFn: async (data: CreateTierPricingRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.admin.tierPricing.create,
                body: data,
                withCredentials: true,
            });
            return response as CreateTierPricingResponse;
        },
    });
};
