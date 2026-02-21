import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { AppTier } from "../types";
import { CreateTierRequest } from "./create-tier";

export type UpdateTierRequest = Partial<CreateTierRequest> & {
    slug: string;
};

export type UpdateTierResponse = {
    success: boolean;
    message: string;
    data: AppTier;
};

export const useUpdateTier = () => {
    return useMutation({
        mutationFn: async (data: UpdateTierRequest) => {
            const { slug, ...body } = data;
            const response = await fetchApi({
                method: "PATCH",
                url: `${AppApi.appTier.admin.crud}/${slug}`,
                body: body,
                withCredentials: true,
            });
            return response as UpdateTierResponse;
        },
    });
};
