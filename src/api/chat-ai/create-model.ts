import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { AiModel } from "./list-models";

export type CreateModelRequest = {
    name: string;
    provider: string;
    modelIdentifier: string;
    description?: string;
    maxTokens?: number;
    supportsImage?: boolean;
    supportsFile?: boolean;
    acceptedImageExtensions?: string[];
    acceptedFileExtensions?: string[];
    maxFileSize?: number;
    status: string;
    isEnabled?: boolean;
    isDefault?: boolean;
};

export type CreateModelResponse = {
    success: boolean;
    message: string;
    data: AiModel;
};

export const useCreateModel = () => {
    return useMutation({
        mutationFn: async (data: CreateModelRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.admin.chatAi.models.create,
                body: data,
                withCredentials: true,
            });
            return response as CreateModelResponse;
        },
    });
};
