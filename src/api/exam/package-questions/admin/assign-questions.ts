import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { AssignPackageQuestionsRequest, AssignPackageQuestionsResponse } from "../types";

export const useAssignPackageQuestions = () => {
  return useMutation({
    mutationKey: ["admin-exam-package-questions-assign"],
    mutationFn: async (body: AssignPackageQuestionsRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packageQuestions.admin.assign,
        body,
        withCredentials: true,
      });
      return response as AssignPackageQuestionsResponse;
    },
  });
};
