import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

export interface TagSimpleItem {
  value: string;
  label: string;
}

export interface ListTagsSimpleResponse {
  success: boolean;
  message: string;
  data: {
    items: TagSimpleItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ListTagSimpleRequest {
  page?: number;
  limit?: number;
}

export const useListTagSimple = (params: ListTagSimpleRequest = {}) => {
  return useQuery({
    queryKey: ["education-tags-list-simple", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.education.tags.listSimple,
        body: params,
        withCredentials: true,
      });
      return response as ListTagsSimpleResponse;
    },
  });
};
