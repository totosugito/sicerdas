import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import type { SubjectResponse } from "./types";

export const useDetailSubject = (id: string | undefined) => {
  return useQuery({
    queryKey: ["exam-subject-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetchApi({
        method: "GET",
        url: AppApi.exam.subjects.detail.replace(":id", id),
      });
      return response as SubjectResponse;
    },
    enabled: !!id,
  });
};
