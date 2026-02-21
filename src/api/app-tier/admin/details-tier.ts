import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { AppTier } from "../types";

export type GetTierResponse = {
    success: boolean;
    message: string;
    data: AppTier;
};

export const useDetailsTier = (slug: string) => {
    return useQuery({
        queryKey: ["admin-tier-pricing-details", slug],
        queryFn: async () => {
            const response = await fetchApi({
                method: "GET",
                url: `${AppApi.appTier.admin.crud}/${slug}`,
                withCredentials: true,
            });
            return response as GetTierResponse;
        },
        enabled: !!slug,
    });
};
