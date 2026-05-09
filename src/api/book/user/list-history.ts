import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export interface HistoryBook {
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
    viewCount: number;
    downloadCount: number;
    isDownloaded: boolean;
  };
  viewedAt: string;
}

export interface HistoryBooksResponse {
  success: boolean;
  message: string;
  data: HistoryBook[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useBookHistory = (params?: { page?: number; pageSize?: number }, options: Partial<UseQueryOptions<HistoryBooksResponse, Error>> = {}) => {
  return useQuery<HistoryBooksResponse>({
    queryKey: ["book-history", params],
    queryFn: async () => {
      const url = AppApi.book.user.history;
      const response = await fetchApi({
        method: "GET",
        url,
        params,
        withCredentials: true,
      });
      return response as HistoryBooksResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
