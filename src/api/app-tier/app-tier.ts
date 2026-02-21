import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { AppTier } from "./types";

export type PublicAppTierResponse = {
    success: boolean;
    message: string;
    data: AppTier[];
};

export const usePublicAppTier = () => {
    return useQuery({
        queryKey: ["public-app-tier"],
        queryFn: async () => {
            const response = await fetchApi({
                method: "GET",
                url: AppApi.appTier.list,
                withCredentials: true,
            });
            return response as PublicAppTierResponse;
        },
    });
};
