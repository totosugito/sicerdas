import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import { AuthProps, LoginFormValues } from "@/types/auth";
import { useAppTranslation } from "@/lib/i18n-typed";
import type { LoginResponse, BaseResponse } from "./types";

export type { LoginResponse };

export const useLoginMutation = () => {
  const auth = useAuth();

  const { t } = useAppTranslation();
  return useMutation<LoginResponse, BaseResponse, { body: LoginFormValues | FormData }>({
    mutationKey: ["login"],
    mutationFn: async ({ body }: { body: LoginFormValues | FormData }) => {
      const response: LoginResponse = await fetchApi({
        method: "POST",
        url: AppApi.auth.signIn,
        body: body,
        headers: { "Content-Type": "multipart/form-data" },
      });

      let userData: AuthProps = { token: null, user: null };
      if (response?.token) {
        userData = {
          token: response.token,
          user: {
            ...response.user,
            name: response.user.name ?? "",
            role: response.user.role ?? undefined,
            createdAt: new Date(response.user.createdAt),
            updatedAt: new Date(response.user.updatedAt),
          },
        };
      } else {
        throw new Error("Error get session");
      }

      await auth.login(userData);
      return response;
    },
  });
};
