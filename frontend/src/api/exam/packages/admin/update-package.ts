import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UpdatePackageRequest, ExamPackageResponse } from "../types";

export const useUpdatePackage = () => {
  return useMutation({
    mutationKey: ["admin-exam-packages-update"],
    mutationFn: async ({ id, ...body }: UpdatePackageRequest) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.exam.packages.admin.update.replace(":id", id),
        body,
        withCredentials: true,
      });
      return response as ExamPackageResponse;
    },
  });
};
