import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export interface UserSession {
  id: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  token: string;
}

export interface SessionListResponse {
  success: boolean;
  message: string;
  data: UserSession[];
}

export const useUserSessionsQuery = () => {
  return useQuery({
    queryKey: ["user-sessions"],
    queryFn: async () => {
      const response = await fetchApi({ method: "GET", url: AppApi.users.user.sessions });
      return response as SessionListResponse;
    },
  });
};
