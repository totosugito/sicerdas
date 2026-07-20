import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { AdminPackageSimpleParams, ListPackagesSimpleResponse } from "../types";

export const useListPackageSimple = (params: AdminPackageSimpleParams = {}) => {
  return useQuery({
    queryKey: ["admin-exam-packages-list-simple", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packages.admin.listSimple,
        body: params,
        withCredentials: true,
      });
      return response as ListPackagesSimpleResponse;
    },
  });
};
