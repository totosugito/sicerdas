import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { BookDetailResponse } from "./types";

export type { BookDetailData as BookDetail } from "./types";

export const useBookDetail = (bookId: string) => {
  return useQuery({
    queryKey: ["book-detail", bookId],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: `${AppApi.book.detail}/${bookId}`,
      });
      return response as BookDetailResponse;
    },
  });
};
