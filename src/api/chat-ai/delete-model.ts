import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export type DeleteModelResponse = {
    success: boolean;
    message: string;
    data: {
        id: string;
    };
};

export const useDeleteModel = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: `${AppApi.admin.chatAi.models.crud}/${id}`,
                withCredentials: true,
            });
            return response as DeleteModelResponse;
        },
    });
};
