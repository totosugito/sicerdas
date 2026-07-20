import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { FavoritePackagesResponse } from "../types";

export const useFavoritePackages = (params?: { page?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: ["exam-packages-favorites", params],
    queryFn: async () => {
      const url = AppApi.exam.packages.user.favorites;
      const response = await fetchApi({
        method: "GET",
        url,
        params,
        withCredentials: true,
      });
      return response as FavoritePackagesResponse;
    },
    staleTime: 5 * 60 * 1000,
  });
};
