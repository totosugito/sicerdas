import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { SyncPackageQuestionsOrderParams, CommonResponse } from "../types";

export const useSyncPackageQuestionsOrder = () => {
  return useMutation({
    mutationKey: ["admin-exam-package-questions-sync-order"],
    mutationFn: async (body: SyncPackageQuestionsOrderParams) => {
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
