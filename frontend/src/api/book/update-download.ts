import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { DownloadResponse } from "./types";

export const useUpdateDownload = () => {
  return useMutation({
    mutationFn: async (data: { bookId?: number; id?: string }) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.book.updateDownload,
        body: data,
      });
      return response as DownloadResponse;
    },
  });
};
