import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface RatePackageRequest {
  packageId: string;
  rating: number;
}

export interface RatePackageResponse {
  success: boolean;
  message: string;
  data: {
    rating: number;
    ratingCount: number;
    userInteraction: {
      rating: number;
    };
  };
}

export const useRatePackage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (req: RatePackageRequest) => {
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
