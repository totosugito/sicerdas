import { useQuery } from "@tanstack/react-query";
import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";
import type { FavoriteCourseItem, FavoritesResponseT } from "backend/src/modules/course/courses/courses.schema.ts";

export type { FavoriteCourseItem };
export type FavoriteCoursesResponse = FavoritesResponseT;


export function useFavoriteCourses(params?: { page?: number; limit?: number }, options?: { enabled?: boolean; staleTime?: number }) {
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
    staleTime: options?.staleTime ?? 30000,
  });
}
