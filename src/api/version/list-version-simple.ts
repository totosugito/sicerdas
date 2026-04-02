import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

import { ListVersionSimpleResponse } from "./types";

export const useListVersionSimple = () => {
  return useMutation({
    mutationKey: ["version-list-simple"],
    mutationFn: async (body: {
      dataType: string;
      search?: string;
      page?: number;
      limit?: number;
    }) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.version.listSimple,
        body: body,
        withCredentials: true,
      });
      return response as ListVersionSimpleResponse;
    },
  });
};
