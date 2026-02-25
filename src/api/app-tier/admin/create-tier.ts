import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { AppTier } from "../types";

export type CreateTierRequest = {
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

export type CreateTierResponse = {
    success: boolean;
    message: string;
    data: AppTier;
};

export const useCreateTier = () => {
    return useMutation({
        mutationKey: ["admin-app-tier-create"],
        mutationFn: async (data: CreateTierRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.appTier.admin.create,
                body: data,
                withCredentials: true,
            });
            return response as CreateTierResponse;
        },
    });
};
