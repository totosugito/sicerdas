import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { GradeListParams, GradeListResponse } from "./types";

export const useListEducationGrade = (params: GradeListParams) => {
  return useQuery({
    queryKey: ["education-grade-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.education.grade.list,
        body: params,
      });
      return response as GradeListResponse;
    },
  });
};
