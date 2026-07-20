import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { AssignQuestionTagsByNameRequest } from "../types";
import type { BaseResponse } from "backend/src/types/index.ts";

export const useAssignQuestionTagByName = () => {
  return useMutation({
    mutationFn: async (body: AssignQuestionTagsByNameRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.questionTags.admin.assignByNames,
        body,
        withCredentials: true,
      });
      return response as BaseResponse;
    },
  });
};
