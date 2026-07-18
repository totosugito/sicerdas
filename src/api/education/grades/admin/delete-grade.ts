import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { BaseResponse } from "backend/src/types/index.ts";

export const useDeleteEducationGrade = () => {
  return useMutation({
    mutationKey: ["admin-education-grade-delete"],
    mutationFn: async (id: number) => {
      const response = await fetchApi({
        method: "DELETE",
        url: AppApi.education.grade.admin.delete.replace(":id", id.toString()),
      });
      return response as BaseResponse;
    },
  });
};
