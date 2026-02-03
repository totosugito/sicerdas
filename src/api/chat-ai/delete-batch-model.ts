import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export type DeleteBatchModelRequest = {
    ids: string[];
};

export type DeleteBatchModelResponse = {
    success: boolean;
    message: string;
    data: {
        id: string;
    }[];
};

export const useDeleteBatchModel = () => {
    return useMutation({
        mutationFn: async (data: DeleteBatchModelRequest) => {
            const response = await fetchApi({
                method: "DELETE",
                url: AppApi.admin.chatAi.models.deleteBatch,
                body: data,
                withCredentials: true,
            });
            return response as DeleteBatchModelResponse;
        },
    });
};
