import { db } from "../../../../../db/db-pool.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { educationCategories } from "../../../../../db/schema/education/categories.ts";
import { and, eq, ilike, sql, desc, asc, inArray } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { PaginationMeta } from "../../../../../types/response.ts";
import type { CourseItem, CourseListQueryParams } from "../../courses.schema.ts";
import { getCourseThumbnailUrl } from "../../../../../utils/course/course-utils.ts";
import { EnumCourseStatus } from "../../../../../db/schema/course/enums.ts";

export interface ListCourseResult extends ServiceResponse {
  data?: {
    items: CourseItem[];
    meta: PaginationMeta;
  };
}

export async function listCourseService(
  params: CourseListQueryParams,
  isPublicOnly: boolean = false,
): Promise<ListCourseResult> {
  const {
    page = 1,
    limit = 10,
    search,
    categoryId,
    categoryKey,
    educationGradeId,
    educationGradeIds,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const offset = (page - 1) * limit;
  const conditions = [];

  if (isPublicOnly) {
    conditions.push(eq(courses.status, EnumCourseStatus.PUBLISHED));
    conditions.push(eq(courses.isPublic, true));
  } else if (status) {
    conditions.push(eq(courses.status, status));
  }

  if (categoryId) {
    conditions.push(eq(courses.categoryId, categoryId));
  }

  if (categoryKey) {
    conditions.push(eq(educationCategories.key, categoryKey));
  }

  if (educationGradeIds && educationGradeIds.length > 0) {
    conditions.push(inArray(courses.educationGradeId, educationGradeIds));
  } else if (educationGradeId) {
    conditions.push(eq(courses.educationGradeId, educationGradeId));
  }

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`;
    conditions.push(ilike(courses.courseName, searchTerm));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Order logic
  const sortColumn = sortBy === "courseName" ? courses.courseName : courses.createdAt;
  const orderDirection = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  // 1. Fetch total count
  const [countResult] = await db
    .select({ total: sql<number>`count(*)` })
    .from(courses)
    .leftJoin(educationCategories, eq(courses.categoryId, educationCategories.id))
    .where(whereClause);

  const total = Number(countResult?.total ?? 0);
  const totalPages = Math.ceil(total / limit);

  // 2. Fetch paginated items
  const rawItems = await db
    .select({
      course: courses,
      category: {
        id: educationCategories.id,
        name: educationCategories.name,
        key: educationCategories.key,
      },
    })
    .from(courses)
    .leftJoin(educationCategories, eq(courses.categoryId, educationCategories.id))
    .where(whereClause)
    .orderBy(orderDirection)
    .limit(limit)
    .offset(offset);

  const items: CourseItem[] = rawItems.map(({ course, category }) => ({
    ...course,
    thumbnail: getCourseThumbnailUrl(course.thumbnail),
    price: course.price ?? 0,
    tags: course.tags ?? [],
    status: course.status!,
    publishDateType: course.publishDateType!,
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
    publishDateStart: course.publishDateStart ? course.publishDateStart.toISOString() : null,
    publishDateEnd: course.publishDateEnd ? course.publishDateEnd.toISOString() : null,
    category: category?.id ? category : null,
  }));

  return {
    success: true,
    data: {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    },
  };
}
