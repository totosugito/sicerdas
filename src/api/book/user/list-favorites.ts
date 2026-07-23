import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { FavoritesResponse } from "../types";

export type { FavoriteBookData as FavoriteBook } from "../types";

export const useFavoriteBooks = (
  params?: { page?: number; limit?: number },
  options: Partial<UseQueryOptions<FavoritesResponse, Error>> = {},
) => {
  return useQuery({
    queryKey: ["book-favorites", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.book.user.favorites,
        params,
      });
      return response as FavoritesResponse;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
