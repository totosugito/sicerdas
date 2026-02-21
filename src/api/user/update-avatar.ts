import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export const useUpdateUserAvatarMutation = () => {
    return useMutation({
        mutationKey: ['update-user-avatar'],
        mutationFn: async ({ formData }: { formData: FormData }) => {
            const response = await fetchApi({
                method: "PATCH",
                url: AppApi.user.avatar,
                body: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        },
    });
}
