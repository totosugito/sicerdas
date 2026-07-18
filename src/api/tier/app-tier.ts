import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { TierItem, TierResponse } from "./types";

export const usePublicAppTier = () => {
    return useQuery({
        queryKey: ["public-app-tier"],
        queryFn: async () => {
            const response = await fetchApi({
                method: "GET",
                url: AppApi.tier.list,
                withCredentials: true,
            });
            return response as TierResponse<TierItem[]>;
        },
    });
};
