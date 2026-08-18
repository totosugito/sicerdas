import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { BaseResponse } from "backend/src/types/index.ts";

export const useDeleteCategory = () => {
  return useMutation({
    mutationKey: ["admin-education-categories-delete"],
    mutationFn: async (id: string) => {
      const response = await fetchApi({
        method: "DELETE",
        url: AppApi.education.categories.admin.delete.replace(":id", id),
      });
      return response as BaseResponse;
    },
  });
};
