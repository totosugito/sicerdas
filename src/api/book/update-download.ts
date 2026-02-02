import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export type UpdateDownloadRequest = {
    bookId?: number;
    id?: string;
};

export type UpdateDownloadResponse = {
    success: boolean;
    message: string;
    data?: {
        downloadCount: number;
    };
};

export const useUpdateDownload = () => {
    return useMutation({
        mutationFn: async (data: UpdateDownloadRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.book.updateDownload,
                body: data,
                withCredentials: true
            });
            return response as UpdateDownloadResponse;
        },
    });
};
