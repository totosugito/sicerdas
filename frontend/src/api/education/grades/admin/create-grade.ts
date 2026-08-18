import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CreateGradeParams, GradeResponse } from "../types";

export const useCreateEducationGrade = () => {
  return useMutation({
    mutationKey: ["admin-education-grade-create"],
    mutationFn: async (body: CreateGradeParams) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.education.grade.admin.create,
        body,
      });
      return response as GradeResponse;
    },
  });
};
