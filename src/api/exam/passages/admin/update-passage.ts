import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";

interface UpdatePassageResponse {
  success: boolean;
  message: string;
  data: { id: string };
}

export interface UpdatePassageRequest {
  title?: string | null;
  content?: Record<string, unknown>[];
  subjectId?: string;
  isActive?: boolean;
}

export const useUpdatePassage = (id: string) => {
  return useMutation({
    mutationKey: ["admin-exam-passages-update", id],
    mutationFn: async (body: UpdatePassageRequest | FormData) => {
      const response = await fetchApi({
        method: "PUT",
        url: AppApi.exam.passages.admin.update.replace(":id", id),
        body,
        withCredentials: true,
      });
      return response as UpdatePassageResponse;
    },
  });
};
