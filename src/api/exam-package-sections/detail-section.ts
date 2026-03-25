import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import { ExamPackageSectionDetailResponse } from "./types";

/**
 * Hook to fetch the detail of an exam package section.
 * GET /api/exam/package-sections/detail/:id
 */
export function useDetailPackageSection(
  id: string,
  params: { page?: number; limit?: number } = {},
) {
  return useQuery({
    queryKey: ["admin-exam-package-section-detail", id, params],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.exam.packageSections.detail.replace(":id", id),
        params: {
          page: params.page,
          limit: params.limit,
        },
        withCredentials: true,
      });
      return response as ExamPackageSectionDetailResponse;
    },
    enabled: !!id,
  });
}
