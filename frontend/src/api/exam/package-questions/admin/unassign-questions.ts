import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UnassignPackageQuestionsParams, CommonResponse } from "../types";

export const useUnassignPackageQuestions = () => {
  return useMutation({
    mutationKey: ["admin-exam-package-questions-unassign"],
    mutationFn: async (body: UnassignPackageQuestionsParams) => {
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
