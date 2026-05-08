import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export interface FavoriteBook {
  id: string;
  bookId: number;
  title: string;
  author?: string;
  cover: {
    xs: string;
    lg: string;
  };
  category: {
    name: string;
  };
  grade: {
    id: number;
    name: string;
  };
  stats: {
    rating: number;
    bookmarkCount: number;
  };
  bookmarkedAt: string;
}

export interface FavoriteBooksResponse {
  success: boolean;
  message: string;
  data: FavoriteBook[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useFavoriteBooks = (params?: { page?: number; pageSize?: number }, options: Partial<UseQueryOptions<FavoriteBooksResponse, Error>> = {}) => {
  return useQuery<FavoriteBooksResponse>({
    queryKey: ["book-favorites", params],
    queryFn: async () => {
      const url = AppApi.book.user.favorites;
      const response = await fetchApi({
        method: "GET",
        url,
        params,
        withCredentials: true,
      });
      return response as FavoriteBooksResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
