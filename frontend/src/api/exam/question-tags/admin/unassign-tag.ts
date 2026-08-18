import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UnassignQuestionTagsRequest } from "../types";
import type { BaseResponse } from "backend/src/types/index.ts";

export const useUnassignQuestionTag = () => {
  return useMutation({
    mutationFn: async (body: UnassignQuestionTagsRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.questionTags.admin.unassign,
        body,
        withCredentials: true,
      });
      return response as BaseResponse;
    },
  });
};
