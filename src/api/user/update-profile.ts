import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export interface UpdateUserData {
    name?: string;
    school?: string;
    educationLevel?: string;
    grade?: string;
    phone?: string;
    address?: string;
    bio?: string;
    dateOfBirth?: string;
    image?: File;
    extra?: any;
}

export const useUpdateUserProfileMutation = () => {
    return useMutation({
        mutationKey: ['update-user-profile'],
        mutationFn: async ({ body }: { body: UpdateUserData }) => {
            // Create FormData object
            const formData = new FormData();

            // Append all fields to FormData
            Object.entries(body).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    if (key === 'image' && value instanceof File) {
                        formData.append(key, value);
                    } else {
                        formData.append(key, value as string);
                    }
                }
            });

            const response = await fetchApi({
                method: "PUT",
                url: AppApi.user.update,
                body: formData,
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response;
        },
    });
}
