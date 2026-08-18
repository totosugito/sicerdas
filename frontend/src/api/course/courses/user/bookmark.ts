import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BookmarkResponse } from "../types";

export const useBookmarkCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: string) => {
      const response = await fetchApi({
        method: "POST",
        url: `${AppApi.course.courses.user.bookmark}/${courseId}`,
        withCredentials: true,
      });
      return response as BookmarkResponse;
    },
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: ["course-courses-detail", courseId] });
    },
  });
};
