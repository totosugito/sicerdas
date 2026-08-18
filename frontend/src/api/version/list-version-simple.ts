import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

import { ListVersionSimpleResponse } from "./types";

export interface ListVersionSimpleRequest {
  dataType: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useListVersionSimple = (params: ListVersionSimpleRequest) => {
  return useQuery({
    queryKey: ["version-list-simple", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.version.listSimple,
        body: params,
        withCredentials: true,
      });
      return response as ListVersionSimpleResponse;
    },
    enabled: !!params.dataType,
  });
};
