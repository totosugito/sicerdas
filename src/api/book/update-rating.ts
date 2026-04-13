import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export type UpdateRatingRequest = {
  bookId: number;
  rating: number;
};

export type UpdateRatingResponse = {
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

export const useUpdateBookRating = () => {
  return useMutation({
    mutationKey: ["update-book-rating"],
    mutationFn: async (data: UpdateRatingRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.book.rating,
        body: data,
        withCredentials: true,
      });
      return response as UpdateRatingResponse;
    },
  });
};
