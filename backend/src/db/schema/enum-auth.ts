import {pgEnum} from "drizzle-orm/pg-core";

export const EnumUserRole = {
  admin: 'admin',
  teacher: 'teacher',
  user: 'user',
  guest: 'guest'
} as const;
export const PgEnumUserRole = pgEnum('UserRole', Object.values(EnumUserRole) as [string, ...string[]]);

