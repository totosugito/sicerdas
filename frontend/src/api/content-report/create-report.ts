import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { CreateReportParams, CreateReportResponse } from "./types";

export const useCreateReportMutation = () => {
  return useMutation({
    mutationKey: ["content-report-create"],
    mutationFn: async ({ body }: { body: CreateReportParams }) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.contentReport.create,
        body,
      });
      return response as CreateReportResponse;
    },
  });
};
