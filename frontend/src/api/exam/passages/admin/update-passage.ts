import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { UpdatePassageParams, PassageDetailResponse } from "../types";

export interface UpdatePassageRequest extends Partial<UpdatePassageParams> {
  id?: string;
}

export const useUpdatePassage = (id: string) => {
  return useMutation({
    mutationKey: ["admin-exam-passages-update", id],
    mutationFn: async (body: UpdatePassageRequest | FormData) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.exam.passages.admin.update.replace(":id", id),
        body,
        withCredentials: true,
      });
      return response as PassageDetailResponse;
    },
  });
};
