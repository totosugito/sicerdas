import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { BookListParams, BookListResponse } from "./types";

export type { BookListItemData } from "./types";

export const useBookList = (body: BookListParams = {}) => {
  return useQuery({
    queryKey: ["book-list", body],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.book.list,
        body,
      });
      return response as BookListResponse;
    },
  });
};
