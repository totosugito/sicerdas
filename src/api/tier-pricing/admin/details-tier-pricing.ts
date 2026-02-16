import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { TierPricing } from "../types";

export type GetTierPricingResponse = {
    success: boolean;
    message: string;
    data: TierPricing;
};

export const useDetailsTierPricing = (slug: string) => {
    return useQuery({
        queryKey: ["admin-tier-pricing-details", slug],
        queryFn: async () => {
            const response = await fetchApi({
                method: "GET",
                url: `${AppApi.admin.tierPricing.crud}/${slug}`,
                withCredentials: true,
            });
            return response as GetTierPricingResponse;
        },
        enabled: !!slug,
    });
};
