import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

export type AiModel = {
    id: string;
    name: string;
    provider: string;
    modelIdentifier: string;
    description?: string;
    status: string;
    isDefault: boolean;
    isEnabled: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ListModelsRequest = {
    search?: string;
    provider?: string;
    status?: string;
    isEnabled?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
};

export type ListModelsResponse = {
    success: boolean;
    message: string;
    data: {
        items: AiModel[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
};

export const useListModels = (params: ListModelsRequest) => {
    return useQuery({
        queryKey: ["admin-chat-ai-models", params],
        queryFn: async () => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.admin.chatAi.models.list,
                body: params,
                withCredentials: true,
            });
            return response as ListModelsResponse;
        },
    });
};
