import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { ListCustomRequest, ListCustomPackagesResponse } from "../types";

export const useListCustomPackages = (params: ListCustomRequest = {}) => {
  return useQuery({
    queryKey: ["exam-packages", "user", "list-custom", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append("page", params.page.toString());
      if (params.pageSize) searchParams.append("pageSize", params.pageSize.toString());

      const response = await fetchApi({
        method: "GET",
        url: AppApi.exam.packages.user.listCustom + "?" + searchParams.toString(),
        withCredentials: true,
      });
      return response as ListCustomPackagesResponse;
    },
  });
};
