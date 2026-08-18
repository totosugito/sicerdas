import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { AdminSectionSimpleParams, PaginatedSectionSimpleListResponse } from "../types";

export const useListPackageSectionSimpleMutation = () => {
  return useMutation({
    mutationKey: ["admin-exam-package-sections-list-simple-mutation"],
    mutationFn: async (params: AdminSectionSimpleParams) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packageSections.admin.listSimple,
        body: params,
        withCredentials: true,
      });
      return response as PaginatedSectionSimpleListResponse;
    },
  });
};
