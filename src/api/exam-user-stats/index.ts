import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { GlobalStats, SubjectStats, TagStats } from "./types";

export interface GlobalStatsResponse {
  success: boolean;
  message: string;
  data: GlobalStats | null;
}

export interface SubjectStatsResponse {
  success: boolean;
  message: string;
  data: SubjectStats[];
}

export interface TagStatsResponse {
  success: boolean;
  message: string;
  data: TagStats[];
}

export const useGlobalStats = () => {
  return useQuery({
    queryKey: ["exam-user-stats-global"],
    queryFn: async () => {
      const url = AppApi.exam.userStats.global;
      const response = await fetchApi({
        method: "GET",
        url,
        withCredentials: true,
      });
      return response as GlobalStatsResponse;
    },
  });
};

export const useSubjectStats = () => {
  return useQuery({
    queryKey: ["exam-user-stats-subjects"],
    queryFn: async () => {
      const url = AppApi.exam.userStats.subjects;
      const response = await fetchApi({
        method: "GET",
        url,
        withCredentials: true,
      });
      return response as SubjectStatsResponse;
    },
  });
};

export const useTagStats = () => {
  return useQuery({
    queryKey: ["exam-user-stats-tags"],
    queryFn: async () => {
      const url = AppApi.exam.userStats.tags;
      const response = await fetchApi({
        method: "GET",
        url,
        withCredentials: true,
      });
      return response as TagStatsResponse;
    },
  });
};
