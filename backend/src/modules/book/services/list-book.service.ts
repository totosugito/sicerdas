import { db } from "../../../db/db-pool.ts";
import {
  books,
  bookCategory,
  bookGroup,
  bookEventStats,
  bookInteractions,
} from "../../../db/schema/book/index.ts";
import { educationGrades } from "../../../db/schema/education/grades.ts";
import { and, eq, inArray, sql, or, ilike, desc } from "drizzle-orm";
import { EnumContentStatus } from "../../../db/schema/enum/enum-app.ts";
import { getBookCoverUrl } from "../../../utils/book/book-utils.ts";
import type { ServiceResponse } from "../../../types/index.ts";
import type { PaginationMeta } from "../../../types/response.ts";
import type { BookListParams, BookListItemData } from "../book.schema.ts";

export interface ListBookResult extends ServiceResponse {
  data?: { items: BookListItemData[]; meta: PaginationMeta };
}

export async function listBookService(
  params: BookListParams,
  userId: string | null,
  latestVersionId: number | undefined,
): Promise<ListBookResult> {
  const {
    category,
    group,
    grade,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = params;
  const offset = (page - 1) * limit;
  const isLoggedIn = !!userId;

  const buildBaseSelect = () => {
    const baseSelect: any = {
      id: books.id,
      bookId: books.bookId,
      title: books.title,
      description: books.description,
      author: books.author,
      publishedYear: books.publishedYear,
      totalPages: books.totalPages,
      size: books.size,
      status: books.status,
      rating: bookEventStats.rating,
      viewCount: bookEventStats.viewCount,
      downloadCount: bookEventStats.downloadCount,
      bookmarkCount: bookEventStats.bookmarkCount,
      isNew: latestVersionId
        ? sql<boolean>`${books.versionId} = ${latestVersionId}`.as("isNew")
        : sql<boolean>`false`.as("isNew"),
      createdAt: books.createdAt,
      updatedAt: books.updatedAt,
      category: { id: bookCategory.id, name: bookCategory.name },
      group: { id: bookGroup.id, name: bookGroup.name, shortName: bookGroup.shortName },
      grade: { id: educationGrades.id, name: educationGrades.name, grade: educationGrades.grade },
    };

    if (isLoggedIn) {
      baseSelect.liked = bookInteractions.liked;
      baseSelect.disliked = bookInteractions.disliked;
      baseSelect.userRating = bookInteractions.rating;
      baseSelect.bookmarked = bookInteractions.bookmarked;
    }

    return baseSelect;
  };

  const conditions = [];
  conditions.push(eq(books.status, EnumContentStatus.PUBLISHED));

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`;
    conditions.push(or(ilike(books.title, searchTerm), ilike(books.author, searchTerm)));
  }

  if (category?.length) {
    const categoryFilter = category.length > 1 ? [category[0]] : category;
    if (categoryFilter[0] === 0) {
      if (latestVersionId) conditions.push(eq(books.versionId, latestVersionId));
    } else if (categoryFilter[0] > 0) {
      conditions.push(inArray(bookCategory.id, categoryFilter));
      if (group?.length) conditions.push(inArray(bookGroup.id, group));
      if (grade?.length) conditions.push(inArray(educationGrades.id, grade));
    }
  }

  let baseQuery = db
    .select(buildBaseSelect())
    .from(books)
    .leftJoin(bookGroup, eq(books.bookGroupId, bookGroup.id))
    .leftJoin(bookCategory, eq(bookGroup.categoryId, bookCategory.id))
    .leftJoin(educationGrades, eq(books.educationGradeId, educationGrades.id))
    .leftJoin(bookEventStats, eq(books.id, bookEventStats.bookId));

  if (isLoggedIn && userId) {
    baseQuery = baseQuery.leftJoin(
      bookInteractions,
      and(eq(books.id, bookInteractions.bookId), eq(bookInteractions.userId, userId)),
    );
  }

  const queryWithWhere = baseQuery.where(and(...conditions));

  const sortColumn =
    sortBy === "title"
      ? books.title
      : sortBy === "rating"
        ? bookEventStats.rating
        : sortBy === "viewCount"
          ? bookEventStats.viewCount
          : sortBy === "downloadCount"
            ? bookEventStats.downloadCount
            : sortBy === "bookmarkCount"
              ? bookEventStats.bookmarkCount
              : sortBy === "updatedAt"
                ? books.updatedAt
                : books.createdAt;

  const query =
    sortOrder === "asc" ? queryWithWhere.orderBy(sortColumn) : queryWithWhere.orderBy(desc(sortColumn));

  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(query.as("subquery"));
  const total = Number(countResult?.count || 0);
  const totalPages = Math.ceil(total / limit);
  const items = await query.limit(limit).offset(offset);

  return {
    success: true,
    data: {
      items: items.map((item: any) => {
        const processed: any = {
          ...item,
          isNew: !!item.isNew,
          cover: getBookCoverUrl({ bookId: item.bookId }),
          createdAt: item.createdAt?.toISOString() ?? new Date().toISOString(),
          updatedAt: item.updatedAt?.toISOString() ?? new Date().toISOString(),
        };
        if (isLoggedIn && "liked" in item) {
          processed.userInteraction = {
            liked: item.liked ?? false,
            disliked: item.disliked ?? false,
            rating: item.userRating != null ? parseFloat(item.userRating.toString()) : 0,
            bookmarked: item.bookmarked ?? false,
          };
        }
        return processed;
      }),
      meta: { total, page, limit, totalPages },
    },
  };
}
