import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CreatePackageParams, CreatePackageResponse } from "../types";

export const useCreatePackage = () => {
  return useMutation({
    mutationKey: ["admin-exam-packages-create"],
    mutationFn: async (body: CreatePackageParams) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packages.admin.create,
        body,
        withCredentials: true,
      });
      return response as CreatePackageResponse;
    },
  });
};
