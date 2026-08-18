import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { CategoryListParams, CategoryListResponse } from "./types";

export const useListCategory = (params: CategoryListParams) => {
  return useQuery({
    queryKey: ["education-categories-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.education.categories.list,
        body: params,
      });
      return response as CategoryListResponse;
    },
  });
};
