import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

export type BookDetil = {
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
    cover: {
        xs: string,
        lg: string,
    },
    pdf: string,
    samples: {
        xs: string,
        lg: string,
    },
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
export type BookDetailResponse = {
    success: boolean;
    message?: string;
    data: BookDetil
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
