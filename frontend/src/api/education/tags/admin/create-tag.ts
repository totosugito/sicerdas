import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CreateTagParams, TagResponse } from "../types";

export const useCreateTag = () => {
  return useMutation({
    mutationKey: ["admin-education-tags-create"],
    mutationFn: async (body: CreateTagParams) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.education.tags.admin.create,
        body,
      });
      return response as TagResponse;
    },
  });
};
