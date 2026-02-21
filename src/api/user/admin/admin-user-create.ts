import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export const useAdminUserCreate = () => {
    return useMutation({
        mutationKey: ['admin-user-create'],
        mutationFn: async ({ body }: { body: any }) => {
            return await fetchApi({ method: "POST", url: `${AppApi.user.adminCreate}`, body: body, withCredentials: true });
        },
    });
}
