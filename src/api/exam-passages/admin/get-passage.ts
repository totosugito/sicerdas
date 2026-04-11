import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

interface GetPassageResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string | null;
    content: Record<string, unknown>[];
    isActive: boolean;
    totalQuestions: number;
    activeQuestions: number;
    createdAt: string;
    updatedAt: string;
    subjectId: string;
  };
}

export const useGetPassage = (id: string) => {
  return useQuery({
    queryKey: ["admin-exam-passages-detail", id],
    queryFn: async () => {
      const response = await fetchApi({
        method: "GET",
        url: AppApi.exam.passages.admin.detail.replace(":id", id),
        withCredentials: true,
      });
      return response as GetPassageResponse;
    },
    enabled: !!id,
  });
};
