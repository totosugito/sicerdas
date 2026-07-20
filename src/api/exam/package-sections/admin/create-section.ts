import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CreateSectionParams, CreateSectionResponse } from "../types";

export const useCreatePackageSection = () => {
  return useMutation({
    mutationKey: ["admin-exam-package-sections-create"],
    mutationFn: async (body: CreateSectionParams) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packageSections.admin.create,
        body,
        withCredentials: true,
      });
      return response as CreateSectionResponse;
    },
  });
};
