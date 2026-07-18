import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { CategorySimpleResponse } from "./types";

export const useListCategorySimple = (params: { page?: number; limit?: number } = {}) => {
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
  });
};
