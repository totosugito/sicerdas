import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { GenericResponse } from "./types";

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchApi({
        method: "DELETE",
        url: AppApi.users.admin.delete.replace(":id", id),
        withCredentials: true,
      });
      return response as GenericResponse;
    },
  });
};
