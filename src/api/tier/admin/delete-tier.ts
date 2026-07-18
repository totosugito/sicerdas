import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { BaseResponse } from "backend/src/types/index.ts";

export const useDeleteTier = () => {
    return useMutation({
        mutationKey: ["admin-tier-delete"],
        mutationFn: async (slug: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: `${AppApi.tier.admin.crud}/${slug}`,
                withCredentials: true,
            });
            return response as BaseResponse;
        },
    });
};
