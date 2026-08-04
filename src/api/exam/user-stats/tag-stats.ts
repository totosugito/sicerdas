import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { TagStatsResponse, TagStatsParams } from "./types";

export const useTagStats = (params?: TagStatsParams) => {
  const page = params?.page || 1;
  const limit = params?.limit || 5;
  const sortBy = params?.sortBy || "accuracyRate";
  const order = params?.order || "desc";

  return useQuery({
    queryKey: ["exam-user-stats-tags", page, limit, sortBy, order],
    queryFn: async () => {
      const url = new URL(AppApi.exam.userStats.tags, window.location.origin);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", limit.toString());
      url.searchParams.append("sortBy", sortBy);
      url.searchParams.append("order", order);

      const response = await fetchApi({
        method: "GET",
        url: url.toString(),
        withCredentials: true,
      });
      return response as TagStatsResponse;
    },
  });
};
