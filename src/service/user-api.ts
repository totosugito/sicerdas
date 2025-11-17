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
  providerId: string | null;
}

export interface UserSession {
  id: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  token: string; // Added token field to match backend response
}

interface UpdateUserData {
  name?: string;
  school?: string;
  grade?: string;
  phone?: string;
  address?: string;
  bio?: string;
  dateOfBirth?: string;
  image?: File;
  extra?: any;
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

export const useUserSessionsQuery = () => {
  return useQuery<UserSession[]>({
    queryKey: ['userSessions'],
    queryFn: async () => {
      const response = await fetchApi({method: "GET", url: AppApi.user.sessions});
      return response.data;
    },
  });
}

// Mutations
export const useUpdateUserProfileMutation = () => {
  return useMutation({
    mutationKey: ['updateUserProfile'],
    mutationFn: async ({body}: { body: UpdateUserData }) => {
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
      
      const response = await fetchApi({method: "PUT", url: AppApi.user.update, body: formData, headers: {'Content-Type': 'multipart/form-data'}});
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
      const response = await fetchApi({method: "PATCH", url: AppApi.user.avatar, body: formData, headers: {'Content-Type': 'multipart/form-data'}});
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