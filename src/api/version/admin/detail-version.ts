import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

import { AppVersionDetailResponse } from "../types";

export const useDetailVersion = (id: string | number) => {
  return useMutation({
    mutationKey: ["version-detail", id],
    mutationFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.version.admin.detail.replace(":id", id.toString()),
        withCredentials: true,
      });
      return response as AppVersionDetailResponse;
    },
  });
};
