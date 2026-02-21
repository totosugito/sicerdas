import { pgEnum } from "drizzle-orm/pg-core";

export const EnumContentType = {
  BOOK: 'book',
  TEST: 'test',
  COURSE: 'course',
  OTHER: 'other'
}
export const PgEnumContentType = pgEnum('data_type', Object.values(EnumContentType) as [string, ...string[]]);

export const EnumContentStatus = {
  PUBLISHED: 'published',
  UNPUBLISHED: 'unpublished',
  ARCHIVED: 'archived',
  DELETED: 'deleted'
} as const
export const PgEnumContentStatus = pgEnum('status', Object.values(EnumContentStatus) as [string, ...string[]]);

export const EnumContentSortingType = {
  NAME: 'name',
  PUBLISHED_DATE: 'published_date',
  CREATED_DATE: 'created_date',
  VIEW_COUNT: 'view_count',
  DOWNLOAD_COUNT: 'download_count',
  FAVORITE_COUNT: 'favorite_count',
  READ_COUNT: 'read_count',
  LIKE_COUNT: 'like_count',
  DISLIKE_COUNT: 'dislike_count',
  RATING: 'rating',
} as const
export const PgEnumContentSortingType = pgEnum('sorting_type', Object.values(EnumContentSortingType) as [string, ...string[]]);

export const EnumEventStatus = {
  VIEW: 'view',
  DOWNLOAD: 'download',
  READ: 'read',
  LIKE: 'like',
  DISLIKE: 'dislike',
  SHARE: 'share',
  FAVORITE: 'favorite',
  RATING: 'rating',
} as const
export const PgEnumEventStatus = pgEnum('event_status', Object.values(EnumEventStatus) as [string, ...string[]]);

export const EnumEducationLevel = {
  SD: 'sd',
  SMP: 'smp',
  SMA: 'sma',
  UNIVERSITY: 'university',
  OTHER: 'other',
  MTS: 'mts',
  SMK: 'smk',
  MI: 'mi',
  STM: 'stm',
  TK: 'tk',
  PAUD: 'paud',
  UNKNOWN: '',
}
export const PgEnumEducationLevel = pgEnum('education_level', Object.values(EnumEducationLevel) as [string, ...string[]]);

export const EnumUsageType = {
  DAILY: 'daily',
  MONTHLY: 'monthly',
} as const
export const PgEnumUsageType = pgEnum('usage_type', Object.values(EnumUsageType) as [string, ...string[]]);

