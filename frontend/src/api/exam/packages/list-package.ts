import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { PublicExamPackage, PaginationMeta } from "./types";

export interface ListPackageClientRequest {
  categoryId?: string;
  categoryKey?: string;
  educationGradeIds?: number[];
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface ListPackagesClientResponse {
  success: boolean;
  message: string;
  data: {
    items: PublicExamPackage[];
    meta: PaginationMeta;
  };
}

export const useListPackageClient = (params: ListPackageClientRequest) => {
  return useQuery({
    queryKey: ["exam-packages-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packages.list,
        body: params,
        withCredentials: true,
      });
      return response as ListPackagesClientResponse;
    },
  });
};
