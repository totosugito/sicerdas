import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { CreateTierParams, TierResponse } from "../types";

export const useCreateTier = () => {
    return useMutation({
        mutationKey: ["admin-app-tier-create"],
        mutationFn: async (data: CreateTierParams) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.tier.admin.create,
                body: data,
                withCredentials: true,
            });
            return response as TierResponse;
        },
    });
};
