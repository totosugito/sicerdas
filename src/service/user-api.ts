import {useMutation, useQuery} from "@tanstack/react-query";
import {fetchApi} from "@/lib/fetch-api";
import {AppApi} from "@/constants/app-api";

// Types for user data
export interface UserProfile {
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
  dateOfBirth: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UpdateUserData {
  name?: string;
  school?: string;
  grade?: string;
  phone?: string;
  address?: string;
  bio?: string;
  dateOfBirth?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Queries
export const useUserProfileQuery = () => {
  return useQuery<UserProfile>({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const response = await fetchApi({method: "GET", url: AppApi.user.details});
      return response.data;
    },
  });
}

// Mutations
export const useUpdateUserProfileMutation = () => {
  return useMutation({
    mutationKey: ['updateUserProfile'],
    mutationFn: async ({body}: { body: UpdateUserData }) => {
      const response = await fetchApi({method: "PUT", url: AppApi.user.update, body: body});
      return response;
    },
  });
}

export const useChangeUserPasswordMutation = () => {
  return useMutation({
    mutationKey: ['changeUserPassword'],
    mutationFn: async ({body}: { body: ChangePasswordData }) => {
      const response = await fetchApi({method: "PUT", url: AppApi.user.changePassword, body: body});
      return response;
    },
  });
}

export const useUpdateUserAvatarMutation = () => {
  return useMutation({
    mutationKey: ['updateUserAvatar'],
    mutationFn: async ({formData}: { formData: FormData }) => {
      const response = await fetchApi({method: "PATCH", url: AppApi.user.avatar, body: formData});
      return response;
    },
  });
}

export const useRemoveUserAvatarMutation = () => {
  return useMutation({
    mutationKey: ['removeUserAvatar'],
    mutationFn: async () => {
      const response = await fetchApi({method: "PATCH", url: `${AppApi.user.avatar}?action=remove`});
      return response;
    },
  });
}