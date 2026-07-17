import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import { UpdateProfileResponse } from "../types";

export interface UpdateProfileData {
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

export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationKey: ["update-profile"],
    mutationFn: async ({ body }: { body: UpdateProfileData }) => {
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
        url: AppApi.users.user.updateProfile,
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response as UpdateProfileResponse;
    },
  });
};
