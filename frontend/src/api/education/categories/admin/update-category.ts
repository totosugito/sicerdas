import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UpdateCategoryParams, CategoryResponse } from "../types";

export type UpdateCategoryRequest = UpdateCategoryParams & { id: string };

export const useUpdateCategory = () => {
  return useMutation({
    mutationKey: ["admin-education-categories-update"],
    mutationFn: async ({ id, ...body }: UpdateCategoryRequest) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.education.categories.admin.update.replace(":id", id),
        body,
      });
      return response as CategoryResponse;
    },
  });
};
