import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { CourseFilterParamsResponse } from "./types";

export const useCourseFilterParams = () => {
  return useQuery({
    queryKey: ["course-courses-filter-params"],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.course.courses.filterParams,
        withCredentials: true,
      });
      return response as CourseFilterParamsResponse;
    },
  });
};
