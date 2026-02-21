import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export const useAdminUserPut = () => {
    return useMutation({
        mutationKey: ['admin-user-put'],
        mutationFn: async ({ id, body }: { id: string, body: any }) => {
            return await fetchApi({ method: "PUT", url: (AppApi.user.adminCrud).replace(':id', id), body: body, withCredentials: true });
        },
    });
}
