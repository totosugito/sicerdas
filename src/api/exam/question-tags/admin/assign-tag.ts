import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { AssignQuestionTagsRequest } from "../types";
import type { BaseResponse } from "backend/src/types/index.ts";

export const useAssignQuestionTag = () => {
  return useMutation({
    mutationFn: async (body: AssignQuestionTagsRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.questionTags.admin.assign,
        body,
        withCredentials: true,
      });
      return response as BaseResponse;
    },
  });
};
