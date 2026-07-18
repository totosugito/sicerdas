import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import type { RatingResponse } from "../types";

export const useRateBook = () => {
  return useMutation({
    mutationKey: ["update-book-rating"],
    mutationFn: async (data: { bookId: number; rating: number }) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.book.user.rating,
        body: data,
      });
      return response as RatingResponse;
    },
  });
};
