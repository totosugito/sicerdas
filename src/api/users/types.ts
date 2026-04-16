import { PaginationData } from "@/components/custom/table";

export interface UserItem {
  id: string;
  name: string;
  email: string;
  emailVerified?: string;
  role: string;
  banned?: boolean;
  banReason?: string;
  image?: string;
  school?: string;
  grade?: string;
  createdAt: string;
  updatedAt: string;
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
