import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CreateCategoryParams, CategoryResponse } from "../types";

export const useCreateCategory = () => {
  return useMutation({
    mutationKey: ["admin-education-categories-create"],
    mutationFn: async (body: CreateCategoryParams) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.education.categories.admin.create,
        body,
      });
      return response as CategoryResponse;
    },
  });
};
