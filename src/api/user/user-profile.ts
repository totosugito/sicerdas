import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export interface UserProfile {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: boolean;
    school: string | null;
    educationLevel: string | null;
    grade: string | null;
    phone: string | null;
    address: string | null;
    bio: string | null;
    dateOfBirth: string | null;
    createdAt: string;
    updatedAt: string;
    providerId: string | null;
    extra?: any;
}

export const useUserProfileQuery = () => {
    return useQuery<UserProfile>({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const response = await fetchApi({ method: "GET", url: AppApi.user.details });
            return response.data;
        },
    });
}
