import { PaginationData } from "@/components/custom/table";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  role: string;
  banned: boolean;
  banReason?: string | null;
  banExpires?: string | null;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
  phone?: string | null;
  address?: string | null;
  bio?: string | null;
  dateOfBirth?: string | null;
  extra?: any;
}

export interface ListUsersResponse {
  success: boolean;
  message: string;
  data: {
    items: UserItem[];
    meta: PaginationData;
  };
}

export interface UserDetailResponse {
  success: boolean;
  message: string;
  data: UserItem;
}

export interface GenericResponse {
  success: boolean;
  message: string;
  data?: any;
}
