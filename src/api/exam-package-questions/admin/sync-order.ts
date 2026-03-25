import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { SyncPackageQuestionsOrderRequest, CommonResponse } from "../types";

/**
 * Hook to sync the order of questions in a package section.
 * POST /api/exam/package-questions/admin/sync-order
 */
export const useSyncPackageQuestionsOrder = () => {
  return useMutation({
    mutationKey: ["admin-exam-package-questions-sync-order"],
    mutationFn: async (body: SyncPackageQuestionsOrderRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packageQuestions.admin.syncOrder,
        body,
        withCredentials: true,
      });
      return response as CommonResponse;
    },
  });
};
