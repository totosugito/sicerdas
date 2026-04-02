import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

import { AppVersionResponse } from "../types";

export const useDeleteVersion = (id: string | number) => {
  return useMutation({
    mutationKey: ["version-delete", id],
    mutationFn: async () => {
      const response = await fetchApi({
        method: "DELETE",
        url: AppApi.version.admin.delete.replace(":id", id.toString()),
        withCredentials: true,
      });
      return response as AppVersionResponse;
    },
  });
};
