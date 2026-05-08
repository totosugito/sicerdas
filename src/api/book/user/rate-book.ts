import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export type RateBookRequest = {
  bookId: number;
  rating: number;
};

export type RateBookResponse = {
  success: boolean;
  message: string;
  data: {
    rating: number; // average
    ratingCount: number;
    userInteraction: {
      rating: number; // user choice
    };
  };
};

export const useRateBook = () => {
  return useMutation({
    mutationKey: ["update-book-rating"],
    mutationFn: async (data: RateBookRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.book.user.rating,
        body: data,
        withCredentials: true,
      });
      return response as RateBookResponse;
    },
  });
};
