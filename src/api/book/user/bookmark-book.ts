import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export type BookmarkBookRequest = {
  bookId: number;
  bookmarked: boolean;
};

export type BookmarkBookResponse = {
  success: boolean;
  message: string;
  data: {
    bookmarked: boolean;
    bookmarkCount: number;
  };
};

export const useBookmarkBook = () => {
  return useMutation({
    mutationKey: ["book-bookmark-update"],
    mutationFn: async (data: BookmarkBookRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.book.user.bookmark,
        body: data,
        withCredentials: true,
      });
      return response as BookmarkBookResponse;
    },
  });
};
