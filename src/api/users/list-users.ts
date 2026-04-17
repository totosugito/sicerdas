import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ListUsersResponse } from "./types";

export interface ListUsersRequest {
  search?: string;
  roles?: string[];
  banned?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const useListUsers = (params: ListUsersRequest) => {
  return useQuery({
    queryKey: ["users-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.users.list,
        body: params,
        withCredentials: true,
      });
      return response as ListUsersResponse;
    },
  });
};
