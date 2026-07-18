import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { UserStatsResponse } from "../types";

export type { UserStatsResponse };

export const useBookStats = (options: Partial<UseQueryOptions<UserStatsResponse, Error>> = {}) => {
  return useQuery({
    queryKey: ["book-user-stats"],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.book.user.stats,
      });
      return response as UserStatsResponse;
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
