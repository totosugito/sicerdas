import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

import { VersionResponse } from "../types";

export const useGetVersion = (id: string | number) => {
  return useQuery({
    queryKey: ["version-detail", id],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.version.admin.detail.replace(":id", id.toString()),
        withCredentials: true,
      });
      return response as VersionResponse;
    },
    enabled: !!id,
  });
};
