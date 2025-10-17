import {pgEnum} from "drizzle-orm/pg-core";

export const EnumContentType = {
  book: 'book',
  test: 'test',
  course: 'course',
  other: 'other'
}
export const PgEnumContentType = pgEnum('data_type', Object.values(EnumContentType) as [string, ...string[]]);

export const EnumContentStatus = {
  published: 'published',
  unpublished: 'unpublished',
  archived: 'archived',
  deleted: 'deleted'
} as const
export const PgEnumContentStatus = pgEnum('status', Object.values(EnumContentStatus) as [string, ...string[]]);

export const EnumReportStatus = {
  pending: 'pending',
  inReview: 'in_review',
  violate: 'violate',
  duplicate: 'duplicate',
  resolved: 'resolved',
  dismissed: 'dismissed',
  error: 'error'
} as const
export const PgEnumReportStatus = pgEnum('report_status', Object.values(EnumReportStatus) as [string, ...string[]]);

export const EnumReportReason = {
  duplicate: 'duplicate',
  error: 'error',
  unknown: 'unknown',
  inappropriate: 'inappropriate',
  spam: 'spam',
  copyright: 'copyright',
  other: 'other'
} as const
export const PgEnumReportReason = pgEnum('report_reason', Object.values(EnumReportReason) as [string, ...string[]]);

export const EnumContentSortingType = {
  name: 'name',
  publishedDate: 'published_date',
  createdDate: 'created_date',
  viewCount: 'view_count',
  downloadCount: 'download_count',
  favoriteCount: 'favorite_count',
  readCount: 'read_count',
  likeCount: 'like_count',
  dislikeCount: 'dislike_count',
  rating: 'rating',
} as const
export const PgEnumContentSortingType = pgEnum('sorting_type', Object.values(EnumContentSortingType) as [string, ...string[]]);

export const EnumEventStatus = {
  view: 'view',
  download: 'download',
  read: 'read',
  like: 'like',
  dislike: 'dislike',
  share: 'share',
  favorite: 'favorite',
  rating: 'rating',
} as const
export const PgEnumEventStatus = pgEnum('event_status', Object.values(EnumEventStatus) as [string, ...string[]]);

export const EnumNotificationType = {
  system: 'system',
  user: 'user',
  content: 'content',
  report: 'report',
  subscription: 'subscription',
  achievement: 'achievement',
  reminder: 'reminder',
} as const
export const PgEnumNotificationType = pgEnum('notification_type', Object.values(EnumNotificationType) as [string, ...string[]]);

export const EnumNotificationStatus = {
  unread: 'unread',
  read: 'read',
  archived: 'archived',
  deleted: 'deleted',
  sent: 'sent',
  failed: 'failed',
  pending: 'pending',
} as const
export const PgEnumNotificationStatus = pgEnum('notification_status', Object.values(EnumNotificationStatus) as [string, ...string[]]);

export const EnumNotificationPriority = {
  low: 'low',
  normal: 'normal',
  high: 'high',
  critical: 'critical',
  error: 'error',
} as const
export const PgEnumNotificationPriority = pgEnum('notification_priority', Object.values(EnumNotificationPriority) as [string, ...string[]]);
