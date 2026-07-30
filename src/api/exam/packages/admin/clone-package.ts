import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { ClonePackageParams, ClonePackageResponse } from "../types";

export const useClonePackage = () => {
  return useMutation({
    mutationKey: ["admin-exam-packages-clone"],
    mutationFn: async (body: ClonePackageParams) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packages.admin.clone,
        body,
        withCredentials: true,
      });
      return response as ClonePackageResponse;
    },
  });
};
