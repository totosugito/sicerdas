import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { AdminPackageListParams, ListPackagesResponse } from "../types";

export const useListPackage = (params: AdminPackageListParams) => {
  return useQuery({
    queryKey: ["admin-exam-packages-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packages.admin.list,
        body: params,
        withCredentials: true,
      });
      return response as ListPackagesResponse;
    },
  });
};
