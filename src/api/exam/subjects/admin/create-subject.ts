import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CreateSubjectParams, SubjectResponse } from "../types";

export const useCreateSubject = () => {
  return useMutation({
    mutationFn: async (body: CreateSubjectParams) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.subjects.admin.create,
        body,
      });
      return response as SubjectResponse;
    },
  });
};
