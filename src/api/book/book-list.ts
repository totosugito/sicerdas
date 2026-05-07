import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";

export type BookListItem = {
  id: number;
  bookId: number;
  title: string;
  description?: string;
  author?: string;
  publishedYear: string;
  totalPages: number;
  size: number;
  status: string;
  rating?: number;
  view?: number;
  favorite?: boolean;
  favoriteTotal?: number;
  cover: {
    xs: string;
    lg: string;
  };
  category: {
    id: number;
    name: string;
  };
  group: {
    id: number;
    name: string;
    shortName?: string;
  };
  grade: {
    id: number;
    name: string;
    grade: string;
  };
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BookListResponse = {
  success: boolean;
  data: {
    items: BookListItem[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
};

export type BookListRequest = {
  category?: number[];
  group?: number[];
  grade?: number[];
  search?: string;
  isBookmarked?: boolean;
  isHistory?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export const useBookList = (body: BookListRequest = {}) => {
  return useQuery({
    queryKey: ["book-list", body],
    queryFn: async () => {
      const response = await fetchApi({
        method: "POST",
        url: `${AppApi.book.list}`,
        body: body,
        withCredentials: true,
      });
      return response as BookListResponse;
    },
  });
};
