import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { AppTier } from "../types";

export type ListTierResponse = {
    success: boolean;
    message: string;
    data: AppTier[];
};

export const useListTier = () => {
    return useQuery({
        queryKey: ["admin-app-tier-list"],
        queryFn: async () => {
            const response = await fetchApi({
                method: "GET",
                url: AppApi.appTier.admin.list,
                withCredentials: true,
            });
            return response as ListTierResponse;
        },
    });
};
