import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export const useRemoveUserAvatarMutation = () => {
    return useMutation({
        mutationKey: ['remove-user-avatar'],
        mutationFn: async () => {
            const response = await fetchApi({ method: "PATCH", url: `${AppApi.user.avatar}?action=remove` });
            return response;
        },
    });
}
