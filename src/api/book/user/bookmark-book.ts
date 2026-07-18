import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { BookmarkResponse } from "../types";

export const useBookmarkBook = () => {
  return useMutation({
    mutationKey: ["book-bookmark-update"],
    mutationFn: async (data: { bookId: number; bookmarked: boolean }) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.book.user.bookmark,
        body: data,
      });
      return response as BookmarkResponse;
    },
  });
};
