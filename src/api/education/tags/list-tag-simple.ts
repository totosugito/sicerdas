import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { TagSimpleResponse } from "./types";

export const useListTagSimple = (params: { page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: ["education-tags-list-simple", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.education.tags.listSimple,
        body: params,
      });
      return response as TagSimpleResponse;
    },
  });
};
