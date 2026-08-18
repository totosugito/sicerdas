import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

import { ListVersionResponse } from "./types";

export interface ListVersionRequest {
  search?: string;
  dataType?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const useListVersion = (params: ListVersionRequest) => {
  return useQuery({
    queryKey: ["version-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.version.list,
        body: params,
        withCredentials: true,
      });
      return response as ListVersionResponse;
    },
  });
};
