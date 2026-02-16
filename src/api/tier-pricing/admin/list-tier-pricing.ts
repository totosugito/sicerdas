import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { TierPricing } from "../types";

export type ListTierPricingResponse = {
    success: boolean;
    message: string;
    data: TierPricing[];
};

export const useListTierPricing = () => {
    return useQuery({
        queryKey: ["admin-tier-pricing-list"],
        queryFn: async () => {
            const response = await fetchApi({
                method: "GET",
                url: AppApi.admin.tierPricing.list,
                withCredentials: true,
            });
            return response as ListTierPricingResponse;
        },
    });
};
