import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UpdateTagParams, TagResponse } from "../types";

export type UpdateTagRequest = UpdateTagParams & { id: string };

export const useUpdateTag = () => {
  return useMutation({
    mutationKey: ["admin-education-tags-update"],
    mutationFn: async ({ id, ...body }: UpdateTagRequest) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.education.tags.admin.update.replace(":id", id),
        body,
      });
      return response as TagResponse;
    },
  });
};
