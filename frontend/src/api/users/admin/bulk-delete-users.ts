import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { BaseResponse, BulkDeleteUsersBody } from "../types";

export const useBulkDeleteUsers = () => {
  return useMutation({
    mutationFn: async (data: BulkDeleteUsersBody) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.users.admin.deletes,
        body: data,
        withCredentials: true,
      });
      return response as BaseResponse;
    },
  });
};
