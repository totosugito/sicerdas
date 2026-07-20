import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { ExamPackageResponse, PublicPackageDetailData } from "./types";

export type PublicDetailPackageResponse = ExamPackageResponse<PublicPackageDetailData>;

export interface DetailPackageClientRequest {
  id: string;
}

export const useDetailPackageClient = ({ id }: DetailPackageClientRequest) => {
  return useQuery({
    queryKey: ["exam-packages-detail", id],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.exam.packages.detail.replace(":id", id),
        withCredentials: true,
      });
      return response as PublicDetailPackageResponse;
    },
    enabled: !!id,
  });
};
