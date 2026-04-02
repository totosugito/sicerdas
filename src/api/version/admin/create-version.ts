import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

import { CreateVersionRequest, AppVersionResponse } from "../types";

export const useCreateVersion = () => {
  return useMutation({
    mutationKey: ["version-create"],
    mutationFn: async (body: CreateVersionRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.version.admin.create,
        body: body,
        withCredentials: true,
      });
      return response as AppVersionResponse;
    },
  });
};
