import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ListUsersResponse, ListUsersBody } from "../types";

export const useListUsers = (params: ListUsersBody) => {
  return useQuery({
    queryKey: ["users-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.users.admin.list,
        body: params,
        withCredentials: true,
      });
      return response as ListUsersResponse;
    },
  });
};
