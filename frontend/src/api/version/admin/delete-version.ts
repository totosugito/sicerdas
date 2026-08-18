import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

import type { BaseResponse } from "backend/src/types/index.ts";

export const useDeleteVersion = () => {
  return useMutation({
    mutationKey: ["version-delete"],
    mutationFn: async (id: string | number) => {
      const response = await fetchApi({
        method: "DELETE",
        url: AppApi.version.admin.delete.replace(":id", id.toString()),
        withCredentials: true,
      });
      return response as BaseResponse;
    },
  });
};
