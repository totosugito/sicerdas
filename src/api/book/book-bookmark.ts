import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export type UpdateBookmarkRequest = {
    bookId: number;
    bookmarked: boolean;
};

export type UpdateBookmarkResponse = {
    success: boolean;
    message: string;
    data: {
        bookmarked: boolean;
        bookmarkCount: number;
    };
};

export const useUpdateBookmark = () => {
    return useMutation({
        mutationFn: async (data: UpdateBookmarkRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.book.bookmark,
                body: data,
                withCredentials: true
            });
            return response as UpdateBookmarkResponse;
        },
    });
};
