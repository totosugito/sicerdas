import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { TierResponse } from "../types";

export const useDetailsTier = (slug: string) => {
    return useQuery({
        queryKey: ["admin-tier-details", slug],
        queryFn: async () => {
            const response = await fetchApi({
                method: "GET",
                url: `${AppApi.tier.admin.crud}/${slug}`,
                withCredentials: true,
            });
            return response as TierResponse;
        },
        enabled: !!slug,
    });
};
