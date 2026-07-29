import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { CategorySimpleResponse, CategorySimpleParams } from "./types";

export const useListCategorySimple = (
  params: CategorySimpleParams = {},
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["education-categories-list-simple", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.education.categories.listSimple,
        body: params,
      });
      return response as CategorySimpleResponse;
    },
    enabled: options?.enabled !== false,
  });
};
