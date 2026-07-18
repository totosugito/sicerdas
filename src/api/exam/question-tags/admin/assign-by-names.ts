import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { AssignQuestionTagsByNameRequest, CommonResponse } from "../types";

export const useAssignQuestionTagByName = () => {
  return useMutation({
    mutationFn: async (body: AssignQuestionTagsByNameRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.questionTags.admin.assignByNames,
        body,
        withCredentials: true,
      });
      return response as CommonResponse;
    },
  });
};
