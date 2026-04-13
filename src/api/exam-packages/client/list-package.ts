import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamPackage } from "../types";
import { PaginationData } from "@/components/custom/table";

export interface ListPackageClientRequest {
  categoryId?: string;
  educationGradeId?: number;
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
    items: ExamPackage[];
    meta: PaginationData;
  };
}

export const useListPackageClient = (params: ListPackageClientRequest) => {
  return useQuery({
    queryKey: ["client-exam-packages-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packages.client.list,
        body: params,
        withCredentials: true,
      });
      return response as ListPackagesClientResponse;
    },
  });
};
