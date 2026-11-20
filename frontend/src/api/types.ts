export interface BaseResponse {
  success: boolean;
  message: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const EnumContentType = {
  BOOK: "book",
  EXAM: "exam",
  TEST: "test",
  COURSE: "course",
  OTHER: "other",
} as const;
export type EnumContentType = (typeof EnumContentType)[keyof typeof EnumContentType];

export const EnumContentStatus = {
  DRAFT: "draft",
  PUBLISHED: "published",
  UNPUBLISHED: "unpublished",
  FINISHED: "finished",
  ARCHIVED: "archived",
  DELETED: "deleted",
} as const;
export type EnumContentStatus = (typeof EnumContentStatus)[keyof typeof EnumContentStatus];

export const EnumContentSortingType = {
  NAME: "name",
  PUBLISHED_DATE: "published_date",
  CREATED_DATE: "created_date",
  VIEW_COUNT: "view_count",
  DOWNLOAD_COUNT: "download_count",
  FAVORITE_COUNT: "favorite_count",
  READ_COUNT: "read_count",
  LIKE_COUNT: "like_count",
  DISLIKE_COUNT: "dislike_count",
  RATING: "rating",
} as const;
export type EnumContentSortingType =
  (typeof EnumContentSortingType)[keyof typeof EnumContentSortingType];

export const EnumEventStatus = {
  VIEW: "view",
  DOWNLOAD: "download",
  READ: "read",
  LIKE: "like",
  DISLIKE: "dislike",
  SHARE: "share",
  FAVORITE: "favorite",
  RATING: "rating",
} as const;
export type EnumEventStatus = (typeof EnumEventStatus)[keyof typeof EnumEventStatus];

export const EnumEducationLevel = {
  SD: "sd",
  SMP: "smp",
  SMA: "sma",
  UNIVERSITY: "university",
  OTHER: "other",
  MTS: "mts",
  SMK: "smk",
  MI: "mi",
  STM: "stm",
  TK: "tk",
  PAUD: "paud",
  UNKNOWN: "",
} as const;
export type EnumEducationLevel =
  (typeof EnumEducationLevel)[keyof typeof EnumEducationLevel];

export const EnumUsageType = {
  DAILY: "daily",
  MONTHLY: "monthly",
} as const;
export type EnumUsageType = (typeof EnumUsageType)[keyof typeof EnumUsageType];

export const EnumReportStatus = {
  PENDING: "pending",
  IN_REVIEW: "in_review",
  VIOLATE: "violate",
  DUPLICATE: "duplicate",
  RESOLVED: "resolved",
  DISMISSED: "dismissed",
  ERROR: "error",
} as const;
export type EnumReportStatus = (typeof EnumReportStatus)[keyof typeof EnumReportStatus];

export const EnumReportReason = {
  DUPLICATE: "duplicate",
  ERROR: "error",
  UNKNOWN: "unknown",
  INAPPROPRIATE: "inappropriate",
  SPAM: "spam",
  COPYRIGHT: "copyright",
  OTHER: "other",
} as const;
export type EnumReportReason = (typeof EnumReportReason)[keyof typeof EnumReportReason];

export const EnumNotificationType = {
  SYSTEM: "system",
  USER: "user",
  CONTENT: "content",
  REPORT: "report",
  SUBSCRIPTION: "subscription",
  ACHIEVEMENT: "achievement",
  REMINDER: "reminder",
} as const;
export type EnumNotificationType =
  (typeof EnumNotificationType)[keyof typeof EnumNotificationType];

export const EnumNotificationStatus = {
  UNREAD: "unread",
  READ: "read",
  ARCHIVED: "archived",
  DELETED: "deleted",
  SENT: "sent",
  FAILED: "failed",
  PENDING: "pending",
} as const;
export type EnumNotificationStatus =
  (typeof EnumNotificationStatus)[keyof typeof EnumNotificationStatus];

export const EnumNotificationPriority = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  CRITICAL: "critical",
  ERROR: "error",
} as const;
export type EnumNotificationPriority =
  (typeof EnumNotificationPriority)[keyof typeof EnumNotificationPriority];

export const EnumJobStatus = {
  PENDING: "pending",
  RUNNING: "running",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;
export type EnumJobStatus = (typeof EnumJobStatus)[keyof typeof EnumJobStatus];

export const EnumJobTrigger = {
  SYSTEM: "system",
  MANUAL: "manual",
  API: "api",
} as const;
export type EnumJobTrigger = (typeof EnumJobTrigger)[keyof typeof EnumJobTrigger];

export const EnumJobGroup = {
  DEFAULT: "default",
  DAILY: "daily",
  MAINTENANCE: "maintenance",
  INTEGRATION: "integration",
  REPORT: "report",
} as const;
export type EnumJobGroup = (typeof EnumJobGroup)[keyof typeof EnumJobGroup];

export const EnumStatsPeriodType = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
} as const;
export type EnumStatsPeriodType =
  (typeof EnumStatsPeriodType)[keyof typeof EnumStatsPeriodType];
