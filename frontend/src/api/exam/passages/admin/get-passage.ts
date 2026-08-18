import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { PassageDetailResponse } from "../types";

export const useGetPassage = (id: string) => {
  return useQuery({
    queryKey: ["admin-exam-passages-detail", id],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.exam.passages.admin.detail.replace(":id", id),
        withCredentials: true,
      });
      return response as PassageDetailResponse;
    },
    enabled: !!id,
  });
};
