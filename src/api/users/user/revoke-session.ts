import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import type { BaseResponse } from "backend/src/types/index.ts";
import type { RevokeSessionBody } from "../types";

export const useRevokeUserSessionMutation = () => {
  return useMutation({
    mutationKey: ["revoke-user-session"],
    mutationFn: async ({ body }: { body: RevokeSessionBody }) => {
      const response = await fetchApi({
        method: "POST",
        url: AppApi.users.user.revokeSession,
        body: body,
      });
      return response as BaseResponse;
    },
  });
};
