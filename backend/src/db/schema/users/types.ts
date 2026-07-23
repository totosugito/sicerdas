import {pgEnum} from "drizzle-orm/pg-core";

export const EnumUserRole = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  USER: 'user',
  GUEST: 'guest'
} as const;
export const PgEnumUserRole = pgEnum('UserRole', Object.values(EnumUserRole) as [string, ...string[]]);

