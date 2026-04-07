import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export interface RevokeSessionData {
  sessionToken: string;
}

export interface RevokeSessionResponse {
  success: boolean;
  message: string;
}

export const useRevokeUserSessionMutation = () => {
  return useMutation({
    mutationKey: ["revoke-user-session"],
    mutationFn: async ({ body }: { body: RevokeSessionData }) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.user.revokeSession,
        body: body,
      });
      return response as RevokeSessionResponse;
    },
  });
};
