import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { GenericResponse } from "./types";

export interface BulkDeleteUsersRequest {
  ids: string[];
}

export const useBulkDeleteUsers = () => {
  return useMutation({
    mutationFn: async (data: BulkDeleteUsersRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.users.admin.deletes,
        body: data,
        withCredentials: true,
      });
      return response as GenericResponse;
    },
  });
};
