import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { AdminSectionSimpleParams, PaginatedSectionSimpleListResponse } from "../types";

export const useListPackageSectionSimple = (params: AdminSectionSimpleParams = {}) => {
  return useQuery({
    queryKey: ["admin-exam-package-sections-list-simple", params],
    queryFn: async () => {
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
