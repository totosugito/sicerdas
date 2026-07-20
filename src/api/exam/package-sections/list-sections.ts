import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { ListSectionParams, PublicListSectionsResponse } from "./types";

export const useListPackageSectionsClient = (req: ListSectionParams) => {
  return useQuery({
    queryKey: ["exam-package-sections-list-client", req.packageId],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packageSections.list,
        body: req,
      });
      return response as PublicListSectionsResponse;
    },
    enabled: !!req.packageId,
  });
};
