import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

export interface SectionSimpleItem {
  value: string;
  label: string;
}

export interface ListSectionsSimpleResponse {
  success: boolean;
  message: string;
  data: {
    items: SectionSimpleItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface ListSectionSimpleRequest {
  packageId?: string;
  page?: number;
  limit?: number;
}

export const useListPackageSectionSimple = (params: ListSectionSimpleRequest = {}) => {
  return useQuery({
    queryKey: ["admin-exam-package-sections-list-simple", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packageSections.admin.listSimple,
        body: params,
        withCredentials: true,
      });
      return response as ListSectionsSimpleResponse;
    },
  });
};
