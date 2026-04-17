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

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    emailVerified: boolean;
    school: string | null;
    grade: string | null;
    phone: string | null;
    address: string | null;
    bio: string | null;
    educationLevel: string | null;
    dateOfBirth: string | null;
    extra: any;
    createdAt: string;
    updatedAt: string;
    providerId: string;
  };
}

export const useUpdateUserProfileMutation = () => {
  return useMutation({
    mutationKey: ["update-user-profile"],
    mutationFn: async ({ body }: { body: UpdateUserData }) => {
      // Create FormData object
      const formData = new FormData();

      // Append all fields to FormData
      Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "image" && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value as string);
          }
        }
      });

      const response = await fetchApi({
        method: "PUT",
        url: AppApi.users.user.update,
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response as UpdateUserResponse;
    },
  });
};
