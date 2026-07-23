import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { HistoryResponse } from "../types";

export type { HistoryBookData as HistoryBook } from "../types";

export const useBookHistory = (
  params?: { page?: number; limit?: number },
  options: Partial<UseQueryOptions<HistoryResponse, Error>> = {},
) => {
  return useQuery({
    queryKey: ["book-history", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.book.user.history,
        params,
      });
      return response as HistoryResponse;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
