import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RatingResponse } from "../types";

export const useRateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ courseId, rating }: { courseId: string; rating: number }) => {
      const response = await fetchApi({
        method: "POST",
        url: `${AppApi.course.courses.user.rating}/${courseId}`,
        body: { rating },
        withCredentials: true,
      });
      return response as RatingResponse;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ["course-courses-detail", courseId] });
    },
  });
};
