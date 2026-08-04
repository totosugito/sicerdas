import { useQuery } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export interface FavoriteCourseItem {
  id: string;
  courseCode: string;
  courseName: string;
  courseDescription: string | null;
  thumbnail: string | null;
  price: number;
  bookmarked: boolean;
  liked: boolean;
  rating: number | null;
}

export interface FavoriteCoursesResponse extends BaseResponse {
  data: {
    items: FavoriteCourseItem[];
    meta: PaginationMeta;
  };
}

export function useFavoriteCourses(params?: { page?: number; limit?: number }, options?: { enabled?: boolean }) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  return useQuery<FavoriteCoursesResponse>({
    queryKey: ["course-favorites", page, limit],
    queryFn: async () => fetchApi({
      method: "GET",
      url: AppApi.course.courses.user.favorites,
      params: { page, limit },
      withCredentials: true,
    }) as Promise<FavoriteCoursesResponse>,
    enabled: options?.enabled ?? true,
  });
}
