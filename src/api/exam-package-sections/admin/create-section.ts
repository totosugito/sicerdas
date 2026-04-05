import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

interface CreateSectionResponse {
  success: boolean;
  message: string;
  data: { id: string };
}

export interface CreateSectionRequest {
  packageId: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  order?: number;
  isActive?: boolean;
  versionId?: number;
}

export const useCreatePackageSection = () => {
  return useMutation({
    mutationKey: ["admin-exam-package-sections-create"],
    mutationFn: async (body: CreateSectionRequest) => {
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
