import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export interface BookStats {
  totalFavorites: number;
  totalMaterialsRead: number;
  totalDownloads: number;
}

export interface BookStatsResponse {
  success: boolean;
  message: string;
  data: BookStats;
}

export const useBookStats = (options: Partial<UseQueryOptions<BookStatsResponse, Error>> = {}) => {
  return useQuery<BookStatsResponse>({
    queryKey: ["book-user-stats"],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.book.user.stats,
        withCredentials: true,
      });
      return response as BookStatsResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};
