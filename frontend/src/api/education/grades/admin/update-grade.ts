import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UpdateGradeParams, GradeResponse } from "../types";

export type UpdateGradeRequest = UpdateGradeParams & { id: number };

export const useUpdateEducationGrade = () => {
  return useMutation({
    mutationKey: ["admin-education-grade-update"],
    mutationFn: async ({ id, ...body }: UpdateGradeRequest) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.education.grade.admin.update.replace(":id", id.toString()),
        body,
      });
      return response as GradeResponse;
    },
  });
};
