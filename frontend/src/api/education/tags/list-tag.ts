import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { TagListParams, TagListResponse } from "./types";

export const useListTag = (params: TagListParams) => {
  return useQuery({
    queryKey: ["education-tags-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.education.tags.list,
        body: params,
      });
      return response as TagListResponse;
    },
  });
};
