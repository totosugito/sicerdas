import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export type BookListItem = {
    id: number,
    bookId: number,
    title: string
    description?: string
    author?: string
    publishedYear: string
    totalPages: number
    size: number
    status: string,
    rating?: number,
    view?: number,
    favorite?: boolean,
    favoriteTotal?: number
    category: {
        id: number
        name: string
    }
    group: {
        id: number
        name: string
    }
    grade: {
        id: number
        name: string
        grade: string
    }
    createdAt: string
    updatedAt: string
}

export type BookListResponse = {
    success: boolean
    data: {
        items: BookListItem[]
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

export const useBookList = () => {
    return useMutation({
        mutationKey: ['book-list'],
        mutationFn: async (body: Record<string, any>) => {
            const response = await fetchApi({ method: "POST", url: `${AppApi.book.list}`, body: body, withCredentials: true });
            return response as BookListResponse;
        },
    });
}
