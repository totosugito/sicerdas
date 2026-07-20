import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { AdminSectionListParams, AdminListSectionsResponse } from "../types";

export const useListPackageSection = (params: AdminSectionListParams) => {
  return useQuery({
    queryKey: ["admin-exam-package-sections-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packageSections.admin.list,
        body: params,
        withCredentials: true,
      });
      return response as AdminListSectionsResponse;
    },
  });
};
