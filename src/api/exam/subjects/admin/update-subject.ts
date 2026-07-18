import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UpdateSubjectParams, SubjectResponse } from "../types";

export type UpdateSubjectRequest = UpdateSubjectParams & { id: string };

export const useUpdateSubject = () => {
  return useMutation({
    mutationFn: async ({ id, ...body }: UpdateSubjectRequest) => {
      const response = await fetchApi({
        method: "PATCH",
        url: AppApi.exam.subjects.admin.update.replace(":id", id),
        body,
      });
      return response as SubjectResponse;
    },
  });
};
