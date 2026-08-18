import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { SubjectListParams, SubjectListResponse } from "./types";

export const useListSubject = (params: SubjectListParams) => {
  return useQuery({
    queryKey: ["exam-subjects-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.subjects.list,
        body: params,
      });
      return response as SubjectListResponse;
    },
  });
};
