import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { UnassignPackageQuestionsRequest, CommonResponse } from "../types";

/**
 * Hook to unassign questions from a package.
 * POST /api/exam/package-questions/admin/unassign
 */
export const useUnassignPackageQuestions = () => {
  return useMutation({
    mutationKey: ["admin-exam-package-questions-unassign"],
    mutationFn: async (body: UnassignPackageQuestionsRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packageQuestions.admin.unassign,
        body,
        withCredentials: true,
      });
      return response as CommonResponse;
    },
  });
};
