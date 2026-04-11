import { useMutation } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { ExamPackageResponse } from "../types";

export interface UploadThumbnailRequest {
  id: string;
  file?: File;
  action?: "remove";
}

export const useUploadPackageThumbnail = () => {
  return useMutation({
    mutationKey: ["admin-exam-packages-thumbnail-upload"],
    mutationFn: async ({ id, file, action }: UploadThumbnailRequest) => {
      const url = AppApi.exam.packages.admin.thumbnail.replace(":id", id);

      let body: any = null;
      let params: any = {};

      if (action === "remove") {
        params.action = "remove";
      } else {
        if (!file) throw new Error("No file selected");
        const formData = new FormData();
        formData.append("file", file);
        body = formData;
      }

      const response = await fetchApi({
        method: "PATCH",
        url,
        body,
        params,
        withCredentials: true,
      });

      return response as ExamPackageResponse;
    },
  });
};
