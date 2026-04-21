import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamPackageSection } from "./types";

export interface ListSectionsClientRequest {
  packageId: string;
}

export interface ListSectionsClientResponse {
  success: boolean;
  message: string;
  data: ExamPackageSection[];
}

export const useListPackageSectionsClient = (req: ListSectionsClientRequest) => {
  return useQuery({
    queryKey: ["exam-package-sections-list-client", req.packageId],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packageSections.list,
        body: req,
      });
      return response as ListSectionsClientResponse;
    },
    enabled: !!req.packageId,
  });
};
