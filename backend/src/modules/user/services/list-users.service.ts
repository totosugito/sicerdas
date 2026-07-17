import { db } from "../../../db/db-pool.ts";
import { users, usersProfile } from "../../../db/schema/user/index.ts";
import { and, asc, desc, eq, ilike, or, sql, inArray } from "drizzle-orm";
import type { PaginationMeta } from "../../../types/response.ts";
import { getUserAvatarUrl } from "../../../utils/user/user-utils.ts";

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  roles?: string[];
  sortBy?: string;
  sortOrder?: string;
}

export interface UserResponseItem {
  id: string;
  email: string;
  name: string;
  role: string;
  image: string | null;
  banned: boolean | null;
  banReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersResponseData {
  items: UserResponseItem[];
  meta: PaginationMeta;
}

export async function listUsersService(params: ListUsersParams): Promise<ListUsersResponseData> {
  const {
    page = 1,
    limit = 10,
    search,
    roles,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const offset = (page - 1) * limit;
  const conditions = [];

  if (search && search.trim() !== "") {
    const searchTerm = `%${search.trim().toLowerCase()}%`;
    conditions.push(or(ilike(users.name, searchTerm), ilike(users.email, searchTerm)));
  }

  if (roles && roles.length > 0) {
    conditions.push(inArray(users.role, roles as any));
  }

  // Build base query
  const baseQuery = db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      image: users.image,
      banned: users.banned,
      banReason: users.banReason,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(usersProfile, eq(users.id, usersProfile.id));

  const queryWithWhere = baseQuery.where(
    conditions.length > 0 ? and(...conditions) : undefined,
  );

  const order = sortOrder === "asc" ? asc : desc;
  let query;

  switch (sortBy) {
    case "name":
      query = queryWithWhere.orderBy(order(users.name));
      break;
    case "email":
      query = queryWithWhere.orderBy(order(users.email));
      break;
    case "role":
      query = queryWithWhere.orderBy(order(users.role));
      break;
    case "updatedAt":
      query = queryWithWhere.orderBy(order(users.updatedAt));
      break;
    case "createdAt":
    default:
      query = queryWithWhere.orderBy(order(users.createdAt));
      break;
  }

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(query.as("subquery"));

  const total = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(total / limit);

  const items = await query.limit(limit).offset(offset);

  return {
    items: items.map((item) => ({
      ...item,
      image: getUserAvatarUrl(item.id, item.image),
      createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: item.updatedAt ? item.updatedAt.toISOString() : new Date().toISOString(),
    })),
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}
