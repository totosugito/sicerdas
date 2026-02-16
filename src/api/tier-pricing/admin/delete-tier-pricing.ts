import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export type DeleteTierPricingResponse = {
    success: boolean;
    message: string;
};

export const useDeleteTierPricing = () => {
    return useMutation({
        mutationFn: async (slug: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: `${AppApi.admin.tierPricing.crud}/${slug}`,
                withCredentials: true,
            });
            return response as DeleteTierPricingResponse;
        },
    });
};
