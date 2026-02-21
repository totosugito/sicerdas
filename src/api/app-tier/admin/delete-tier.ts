import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export type DeleteTierResponse = {
    success: boolean;
    message: string;
};

export const useDeleteTier = () => {
    return useMutation({
        mutationFn: async (slug: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: `${AppApi.appTier.adminCrud}/${slug}`,
                withCredentials: true,
            });
            return response as DeleteTierResponse;
        },
    });
};
