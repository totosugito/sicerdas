import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UpdateSectionRequest, SectionResponse } from "../types";

export const useUpdatePackageSection = () => {
  return useMutation({
    mutationKey: ["admin-exam-package-sections-update"],
    mutationFn: async ({ id, ...body }: UpdateSectionRequest) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.exam.packageSections.admin.update.replace(":id", id),
        body,
        withCredentials: true,
      });
      return response as SectionResponse;
    },
  });
};
