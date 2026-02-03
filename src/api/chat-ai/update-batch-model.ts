import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export type UpdateBatchModelRequest = {
    ids: string[];
    isEnabled: boolean;
};

export type UpdateBatchModelResponse = {
    success: boolean;
    message: string;
    data: {
        id: string;
        isEnabled: boolean;
    }[];
};

export const useUpdateBatchModel = () => {
    return useMutation({
        mutationFn: async (data: UpdateBatchModelRequest) => {
            const response = await fetchApi({
                method: "PATCH",
                url: AppApi.admin.chatAi.models.updateBatch,
                body: data,
                withCredentials: true,
            });
            return response as UpdateBatchModelResponse;
        },
    });
};
