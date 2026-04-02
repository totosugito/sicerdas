import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

import { ListVersionResponse } from "./types";

export const useListVersion = () => {
  return useMutation({
    mutationKey: ["version-list"],
    mutationFn: async (body: Record<string, any>) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.version.list,
        body: body,
        withCredentials: true,
      });
      return response as ListVersionResponse;
    },
  });
};
