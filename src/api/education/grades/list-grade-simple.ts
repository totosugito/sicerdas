import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { GradeSimpleResponse, GradeSimpleParams } from "./types";

export const useListGradeSimple = (
  params: GradeSimpleParams = {},
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["education-grades-list-simple", params],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.education.grade.listSimple,
        body: params,
      });
      return response as GradeSimpleResponse;
    },
    enabled: options?.enabled !== false,
  });
};
