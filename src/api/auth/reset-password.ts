import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export const useResetPasswordMutation = () => {
    return useMutation({
        mutationKey: ['resetPassword'],
        mutationFn: async ({ body }: { body: Record<string, any> }) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.auth.resetPassword,
                body: body,
                headers: { 'Content-Type': 'application/json' }
            });
            return response;
        },
    });
};
