import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export const useAdminChangePassword = () => {
    return useMutation({
        mutationKey: ['admin-user-change-password'],
        mutationFn: async ({ id, body }: { id: string, body: Record<string, any> }) => {
            return await fetchApi({ method: "PATCH", url: (AppApi.user.admin.changePassword).replace(':id', id), body: body, withCredentials: true });
        },
    });
}
