import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export const useChangeUserPasswordMutation = () => {
    return useMutation({
        mutationKey: ['change-user-password'],
        mutationFn: async ({ body }: { body: ChangePasswordData }) => {
            const response = await fetchApi({ method: "PUT", url: AppApi.user.changePassword, body: body });
            return response;
        },
    });
}
