import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { UpdateTierParams, TierResponse } from "../types";

export type UpdateTierRequest = UpdateTierParams & {
    slug: string;
};

export const useUpdateTier = () => {
    return useMutation({
        mutationKey: ["admin-app-tier-update"],
        mutationFn: async (data: UpdateTierRequest) => {
            const { slug, ...body } = data;
            const response = await fetchApi({
                method: "PATCH",
                url: `${AppApi.tier.admin.crud}/${slug}`,
                body: body,
                withCredentials: true,
            });
            return response as TierResponse;
        },
    });
};
