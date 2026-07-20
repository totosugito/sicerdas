import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { AdminSectionDetailResponse } from "../types";

export function useDetailPackageSection(id: string) {
  return useQuery({
    queryKey: ["admin-exam-package-section-detail", id],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.exam.packageSections.admin.detail.replace(":id", id),
        withCredentials: true,
      });
      return response as AdminSectionDetailResponse;
    },
    enabled: !!id,
  });
}
