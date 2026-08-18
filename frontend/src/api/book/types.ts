import type {
  BookListItemData,
  BookDetailData,
  FilterParamsData,
  HistoryBookData,
  FavoriteBookData,
  BookListParams,
} from "backend/src/modules/book/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  BookListItemData,
  BookDetailData,
  FilterParamsData,
  HistoryBookData,
  FavoriteBookData,
  BookListParams,
};

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
