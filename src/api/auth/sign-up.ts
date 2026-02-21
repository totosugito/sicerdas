import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export const useSignUpMutation = () => {
    return useMutation({
        mutationKey: ['signUp'],
        mutationFn: async ({ body }: { body: Record<string, any> }) => {
            const response = await fetchApi({ method: "POST", url: AppApi.auth.signUp, body: body });
            return response;
        },
    });
};
