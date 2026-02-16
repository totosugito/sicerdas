import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { TierPricing } from "../types";
import { CreateTierPricingRequest } from "./create-tier-pricing";

export type UpdateTierPricingRequest = Partial<CreateTierPricingRequest> & {
    slug: string; // The original slug needed to construct the URL
};

export type UpdateTierPricingResponse = {
    success: boolean;
    message: string;
    data: TierPricing;
};

export const useUpdateTierPricing = () => {
    return useMutation({
        mutationFn: async (data: UpdateTierPricingRequest) => {
            const { slug, ...body } = data;
            const response = await fetchApi({
                method: "PATCH",
                url: `${AppApi.admin.tierPricing.crud}/${slug}`,
                body: body,
                withCredentials: true,
            });
            return response as UpdateTierPricingResponse;
        },
    });
};
