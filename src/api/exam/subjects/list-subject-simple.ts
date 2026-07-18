import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { SubjectSimpleResponse } from "./types";

export const useListSubjectSimple = (params: { search?: string; page?: number; limit?: number } = {}) => {
  return useQuery({
    queryKey: ["exam-subjects-list-simple", params],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.subjects.listSimple,
        body: params,
      });
      return response as SubjectSimpleResponse;
    },
  });
};
