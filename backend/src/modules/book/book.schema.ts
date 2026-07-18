import { Type, type Static } from "@sinclair/typebox";
import { BaseResponseSchema, PaginationMetaSchema } from "../../types/response.ts";

const BookCoverSchema = Type.Object({
  xs: Type.String(),
  lg: Type.String(),
});

const BookCategoryRef = Type.Object({
  id: Type.Number(),
  name: Type.String(),
});

const BookGroupRef = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  shortName: Type.String(),
});

const BookGradeRef = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  grade: Type.String(),
});

const UserInteractionSchema = Type.Object({
  liked: Type.Boolean(),
  disliked: Type.Boolean(),
  rating: Type.Number(),
  bookmarked: Type.Boolean(),
});

const BookBaseFields = {
  id: Type.String({ format: "uuid" }),
  bookId: Type.Number(),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  publishedYear: Type.String(),
  totalPages: Type.Number(),
  size: Type.Number(),
  status: Type.String(),
  rating: Type.Optional(Type.Number()),
  viewCount: Type.Optional(Type.Number()),
  downloadCount: Type.Optional(Type.Number()),
  bookmarkCount: Type.Optional(Type.Number()),
  cover: BookCoverSchema,
  category: BookCategoryRef,
  group: BookGroupRef,
  grade: BookGradeRef,
  userInteraction: Type.Optional(UserInteractionSchema),
  isNew: Type.Boolean(),
  createdAt: Type.String({ format: "date-time" }),
  updatedAt: Type.String({ format: "date-time" }),
};

const BookListSchema = Type.Object(BookBaseFields);
const BookDetailSchema = Type.Intersect([
  Type.Object(BookBaseFields),
  Type.Object({
    ratingCount: Type.Optional(Type.Number()),
    pdf: Type.String(),
    samples: BookCoverSchema,
    userInteraction: Type.Optional(
      Type.Intersect([
        UserInteractionSchema,
        Type.Object({
          viewCount: Type.Number(),
          downloadCount: Type.Number(),
        }),
      ]),
    ),
  }),
]);

export const FilterParamsGroupItem = Type.Object({
  id: Type.Number(),
  name: Type.String(),
  shortName: Type.String(),
  desc: Type.Optional(Type.String()),
  status: Type.String(),
  stats: Type.Object({ bookTotal: Type.Number() }),
});

export const FilterParamsItem = Type.Object({
  id: Type.Number(),
  code: Type.String(),
  name: Type.String(),
  desc: Type.Optional(Type.String()),
  status: Type.String(),
  groups: Type.Array(FilterParamsGroupItem),
});

export const HistoryBookItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  bookId: Type.Number(),
  title: Type.String(),
  author: Type.Optional(Type.String()),
  cover: BookCoverSchema,
  category: Type.Object({ name: Type.String() }),
  grade: BookGradeRef,
  stats: Type.Object({
    rating: Type.Number(),
    viewCount: Type.Number(),
    downloadCount: Type.Number(),
    isDownloaded: Type.Boolean(),
  }),
  viewedAt: Type.String({ format: "date-time" }),
});

export const FavoriteBookItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  bookId: Type.Number(),
  title: Type.String(),
  author: Type.Optional(Type.String()),
  cover: BookCoverSchema,
  category: Type.Object({ name: Type.String() }),
  grade: BookGradeRef,
  stats: Type.Object({
    rating: Type.Number(),
    bookmarkCount: Type.Number(),
    viewCount: Type.Number(),
    downloadCount: Type.Number(),
    isDownloaded: Type.Boolean(),
  }),
  bookmarkedAt: Type.String({ format: "date-time" }),
});

export const GroupStatsItem = Type.Object({
  groupId: Type.Number(),
  bookTotal: Type.Number(),
  updatedAt: Type.String({ format: "date-time" }),
});

export const BookListBody = Type.Object({
  category: Type.Optional(Type.Array(Type.Number())),
  group: Type.Optional(Type.Array(Type.Number())),
  grade: Type.Optional(Type.Array(Type.Number())),
  search: Type.Optional(Type.String()),
  sortBy: Type.Optional(Type.String({ default: "createdAt" })),
  sortOrder: Type.Optional(Type.String({ default: "desc" })),
  page: Type.Optional(Type.Number({ default: 1, minimum: 1 })),
  limit: Type.Optional(Type.Number({ default: 10, minimum: 1, maximum: 20 })),
});

export const BookmarkBody = Type.Object({
  bookId: Type.Number(),
  bookmarked: Type.Boolean(),
});

export const RatingBody = Type.Object({
  bookId: Type.Number(),
  rating: Type.Number({ minimum: 1, maximum: 5 }),
});

export const DownloadBody = Type.Object({
  id: Type.Optional(Type.String({ format: "uuid" })),
  bookId: Type.Optional(Type.Number()),
});

export const BookListResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      items: Type.Array(BookListSchema),
      meta: PaginationMetaSchema,
    }),
  }),
]);

export const BookDetailResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: BookDetailSchema }),
]);

export const FilterParamsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: Type.Array(FilterParamsItem) }),
]);

export const BookmarkResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      bookmarked: Type.Boolean(),
      bookmarkCount: Type.Number(),
    }),
  }),
]);

export const RatingResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      rating: Type.Number(),
      ratingCount: Type.Number(),
      userInteraction: Type.Object({ rating: Type.Number() }),
    }),
  }),
]);

export const UserStatsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Object({
      totalFavorites: Type.Number(),
      totalMaterialsRead: Type.Number(),
      totalDownloads: Type.Number(),
    }),
  }),
]);

export const HistoryResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Array(HistoryBookItem),
    pagination: PaginationMetaSchema,
  }),
]);

export const FavoritesResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Array(FavoriteBookItem),
    pagination: PaginationMetaSchema,
  }),
]);

export const DownloadResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({
    data: Type.Optional(Type.Object({ downloadCount: Type.Number() })),
  }),
]);

export const GroupStatsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: GroupStatsItem }),
]);

export const AllGroupStatsResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: Type.Array(GroupStatsItem) }),
]);

export type BookListParams = Static<typeof BookListBody>;
export type BookListItemData = Static<typeof BookListSchema>;
export type BookDetailData = Static<typeof BookDetailSchema>;
export type FilterParamsData = Static<typeof FilterParamsItem>;
export type HistoryBookData = Static<typeof HistoryBookItem>;
export type FavoriteBookData = Static<typeof FavoriteBookItem>;
export type GroupStatsData = Static<typeof GroupStatsItem>;

export const BookInfoQuery = Type.Object({
  bookId: Type.Number(),
  page: Type.Number(),
});

export const BookInfoResponseItem = Type.Object({
  id: Type.String({ format: "uuid" }),
  bookId: Type.Number(),
  title: Type.String(),
  description: Type.Optional(Type.String()),
  author: Type.Optional(Type.String()),
  publishedYear: Type.String(),
  totalPages: Type.Number(),
  size: Type.Number(),
  status: Type.String(),
  pdf: Type.String(),
});

export const BookInfoResponse = Type.Intersect([
  BaseResponseSchema,
  Type.Object({ data: BookInfoResponseItem }),
]);

export type BookInfoData = Static<typeof BookInfoResponseItem>;
