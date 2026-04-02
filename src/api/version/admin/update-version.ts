import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

import { UpdateVersionRequest, AppVersionResponse } from "../types";

export const useUpdateVersion = (id: string | number) => {
  return useMutation({
    mutationKey: ["version-update", id],
    mutationFn: async (body: UpdateVersionRequest) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.version.admin.update.replace(":id", id.toString()),
        body,
        withCredentials: true,
      });
      return response as AppVersionResponse;
    },
  });
};
