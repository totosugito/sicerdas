import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { CreatePassageParams, PassageDetailResponse } from "../types";

export const useCreatePassage = () => {
  return useMutation({
    mutationKey: ["admin-exam-passages-create"],
    mutationFn: async (body: CreatePassageParams | FormData) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.passages.admin.create,
        body,
        withCredentials: true,
      });
      return response as PassageDetailResponse;
    },
  });
};
