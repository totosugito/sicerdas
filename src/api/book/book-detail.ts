import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

export type BookDetailResponse = {
    success: boolean;
    message?: string;
    data: {
        id: string;
        bookId: number;
        title: string;
        description?: string;
        author?: string;
        publishedYear: string;
        totalPages: number;
        size: number;
        status: string;
        rating?: number;
        viewCount?: number;
        category: {
            id: number;
            name: string;
        };
        group: {
            id: number;
            name: string;
            shortName: string;
        };
        grade: {
            id: number;
            name: string;
            grade: string;
        };
        userInteraction?: {
            liked: boolean;
            disliked: boolean;
            rating: number;
            bookmarked: boolean;
        };
        createdAt: string;
        updatedAt: string;
    }
}

export const useBookDetail = (bookId: string) => {
    return useQuery({
        queryKey: ['book-detail', bookId],
        queryFn: async () => {
            const response = await fetchApi({
                method: "GET",
                url: `${AppApi.book.detail}/${bookId}`,
                withCredentials: true
            });
            return response as BookDetailResponse;
        },
    });
}
