import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamFilterParamsResponse } from "./types";

export const useExamFilterParams = () => {
  return useQuery({
    queryKey: ["exam-packages-filter-params"],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.exam.packages.filterParams,
      });
      return response as ExamFilterParamsResponse;
    },
  });
};
