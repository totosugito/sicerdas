import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { TierPricing } from "./types";

export type PublicListTierPricingResponse = {
    success: boolean;
    message: string;
    data: TierPricing[];
};

export const usePublicListTierPricing = () => {
    return useQuery({
        queryKey: ["public-tier-pricing-list"],
        queryFn: async () => {
            const response = await fetchApi({
                method: "GET",
                url: AppApi.tierPricing.list,
                withCredentials: true,
            });
            return response as PublicListTierPricingResponse;
        },
    });
};
