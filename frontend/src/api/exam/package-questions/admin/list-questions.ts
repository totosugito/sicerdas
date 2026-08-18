import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { PackageQuestionListParams, ListPackageQuestionsResponse } from "../types";

export function useListPackageQuestions(params: PackageQuestionListParams) {
  return useQuery({
    queryKey: ["admin-exam-package-questions-list", params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packageQuestions.admin.list,
        body: params,
        withCredentials: true,
      });
      return response as ListPackageQuestionsResponse;
    },
    enabled: !!params.packageId,
  });
}
