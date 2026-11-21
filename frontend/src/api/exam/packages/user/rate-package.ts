import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateRatingParams, RatePackageResponse } from "../types";

export const useRatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (req: UpdateRatingParams) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packages.user.rating,
        body: req,
        withCredentials: true,
      });
      return response as RatePackageResponse;
    },
  });
};
