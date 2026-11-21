import type { BaseResponse, PaginationMeta } from "@/api/types";

export interface BookCoverInfo {
  xs: string;
  lg: string;
}

export interface BookCategoryRef {
  id: number;
  name: string;
}

export interface BookGroupRef {
  id: number;
  name: string;
  shortName: string;
}

export interface BookGradeRef {
  id: number;
  name: string;
  grade: string;
}

export interface BookUserInteraction {
  liked: boolean;
  disliked: boolean;
  rating: number;
  bookmarked: boolean;
}

export interface BookListItemData {
  id: string;
  bookId: number;
  title: string;
  description?: string;
  author?: string;
  publishedYear: string;
  totalPages: number;
  size: number;
  status: string;
  rating?: number;
  viewCount?: number;
  downloadCount?: number;
  bookmarkCount?: number;
  cover: BookCoverInfo;
  category: BookCategoryRef;
  group: BookGroupRef;
  grade: BookGradeRef;
  userInteraction?: BookUserInteraction;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookDetailData extends BookListItemData {
  ratingCount?: number;
  pdf: string;
  samples: BookCoverInfo;
  userInteraction?: BookUserInteraction & {
    viewCount: number;
    downloadCount: number;
  };
}

export interface FilterParamsGroupItem {
  id: number;
  name: string;
  shortName: string;
  desc?: string;
  status: string;
  stats: { bookTotal: number };
}

export interface FilterParamsData {
  id: number;
  code: string;
  name: string;
  desc?: string;
  status: string;
  groups: FilterParamsGroupItem[];
}

export interface HistoryBookData {
  id: string;
  bookId: number;
  title: string;
  author?: string;
  cover: BookCoverInfo;
  category: { name: string };
  grade: BookGradeRef;
  stats: {
    rating: number;
    viewCount: number;
    downloadCount: number;
    isDownloaded: boolean;
  };
  viewedAt: string;
}

export interface FavoriteBookData {
  id: string;
  bookId: number;
  title: string;
  author?: string;
  cover: BookCoverInfo;
  category: { name: string };
  grade: BookGradeRef;
  stats: {
    rating: number;
    bookmarkCount: number;
    viewCount: number;
    downloadCount: number;
    isDownloaded: boolean;
  };
  bookmarkedAt: string;
}

export interface BookListParams {
  category?: number[];
  group?: number[];
  grade?: number[];
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export interface BookListResponse extends BaseResponse {
  data: {
    items: BookListItemData[];
    meta: PaginationMeta;
  };
}

export interface BookDetailResponse extends BaseResponse {
  data: BookDetailData;
}

export interface FilterParamsResponse extends BaseResponse {
  data: FilterParamsData[];
}

export interface BookmarkResponse extends BaseResponse {
  data: {
    bookmarked: boolean;
    bookmarkCount: number;
  };
}

export interface RatingResponse extends BaseResponse {
  data: {
    rating: number;
    ratingCount: number;
    userInteraction: {
      rating: number;
    };
  };
}

export interface UserStatsResponse extends BaseResponse {
  data: {
    totalFavorites: number;
    totalMaterialsRead: number;
    totalDownloads: number;
  };
}

export interface HistoryResponse extends BaseResponse {
  data: HistoryBookData[];
  pagination: PaginationMeta;
}

export interface FavoritesResponse extends BaseResponse {
  data: FavoriteBookData[];
  pagination: PaginationMeta;
}

export interface DownloadResponse extends BaseResponse {
  data?: {
    downloadCount: number;
  };
}
