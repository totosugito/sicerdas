import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import { ListPackageQuestionsRequest, ListPackageQuestionsResponse } from "../types";

/**
 * Hook to fetch the list of questions in a package, filtered by section if needed.
 * POST /api/exam/package-questions/admin/list
 */
export function useListPackageQuestions(params: ListPackageQuestionsRequest) {
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
