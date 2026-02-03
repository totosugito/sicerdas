import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { AiModel } from "./list-models";
import { CreateModelRequest } from "./create-model";

export type UpdateModelRequest = Partial<CreateModelRequest> & {
    id: string;
};

export type UpdateModelResponse = {
    success: boolean;
    message: string;
    data: AiModel;
};

export const useUpdateModel = () => {
    return useMutation({
        mutationFn: async (data: UpdateModelRequest) => {
            const { id, ...body } = data;
            const response = await fetchApi({
                method: "PATCH",
                url: `${AppApi.admin.chatAi.models.crud}/${id}`,
                body: body,
                withCredentials: true,
            });
            return response as UpdateModelResponse;
        },
    });
};
