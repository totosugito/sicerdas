import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { EnumExamPackageUserStatus } from "@/api/exam/packages/types";

export interface FavoritePackage {
  id: string;
  title: string;
  category: {
    name: string;
  };
  thumbnail: string | null;
  stats: {
    rating: number;
    activeQuestions: number;
    activeSections: number;
  };
  userInteraction: {
    status: EnumExamPackageUserStatus;
    completedSectionsCount: number;
  };
  bookmarkedAt: string;
}

export interface FavoritePackagesResponse {
  success: boolean;
  message: string;
  data: FavoritePackage[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useFavoritePackages = (params?: { page?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: ["exam-packages-favorites", params],
    queryFn: async () => {
      const url = AppApi.exam.packages.user.favorites;
      const response = await fetchApi({
        method: "GET",
        url,
        params,
        withCredentials: true,
      });
      return response as FavoritePackagesResponse;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
