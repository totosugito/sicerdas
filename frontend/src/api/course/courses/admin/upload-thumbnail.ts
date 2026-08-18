import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UploadCourseThumbnailRequest, ThumbnailResponse } from "../types";

export const useUploadCourseThumbnail = () => {
  return useMutation({
    mutationKey: ["admin-course-courses-thumbnail-upload"],
    mutationFn: async ({ id, file, action }: UploadCourseThumbnailRequest) => {
      const url = AppApi.course.courses.admin.thumbnail.replace(":id", id);

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

      return response as ThumbnailResponse;
    },
  });
};
