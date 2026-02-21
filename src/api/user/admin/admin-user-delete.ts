import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export const useAdminUserDelete = () => {
    return useMutation({
        mutationKey: ['admin-user-delete'],
        mutationFn: async ({ body }: { body: any }) => {
            return await fetchApi({ method: "DELETE", url: `${AppApi.user.admin.delete}`, body: body, withCredentials: true });
        },
    });
}
