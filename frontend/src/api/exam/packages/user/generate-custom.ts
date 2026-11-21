import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { GenerateCustomParams, GenerateCustomResponse } from "../types";

export const useGenerateCustom = () => {
  return useMutation({
    mutationFn: async (body: GenerateCustomParams) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packages.user.generateCustom,
        body,
        withCredentials: true,
      });
      return response as GenerateCustomResponse;
    },
  });
};
