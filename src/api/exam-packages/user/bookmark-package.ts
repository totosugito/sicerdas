import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

export interface BookmarkPackageRequest {
  packageId: string;
  bookmarked: boolean;
}

export interface BookmarkPackageResponse {
  success: boolean;
  message: string;
  data: {
    bookmarked: boolean;
    bookmarkCount: number;
  };
}

export const useBookmarkPackage = () => {
  return useMutation({
    mutationFn: async (body: BookmarkPackageRequest) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.exam.packages.user.bookmark,
        body,
        withCredentials: true,
      });
      return response as BookmarkPackageResponse;
    },
  });
};
