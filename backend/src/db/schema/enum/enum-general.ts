import { pgEnum } from "drizzle-orm/pg-core";

export const EnumReportStatus = {
    PENDING: 'pending',
    IN_REVIEW: 'in_review',
    VIOLATE: 'violate',
    DUPLICATE: 'duplicate',
    RESOLVED: 'resolved',
    DISMISSED: 'dismissed',
    ERROR: 'error'
} as const
export const PgEnumReportStatus = pgEnum('report_status', Object.values(EnumReportStatus) as [string, ...string[]]);

export const EnumReportReason = {
    DUPLICATE: 'duplicate',
    ERROR: 'error',
    UNKNOWN: 'unknown',
    INAPPROPRIATE: 'inappropriate',
    SPAM: 'spam',
    COPYRIGHT: 'copyright',
    OTHER: 'other'
} as const
export const PgEnumReportReason = pgEnum('report_reason', Object.values(EnumReportReason) as [string, ...string[]]);

export const EnumNotificationType = {
    SYSTEM: 'system',
    USER: 'user',
    CONTENT: 'content',
    REPORT: 'report',
    SUBSCRIPTION: 'subscription',
    ACHIEVEMENT: 'achievement',
    REMINDER: 'reminder',
} as const
export const PgEnumNotificationType = pgEnum('notification_type', Object.values(EnumNotificationType) as [string, ...string[]]);

export const EnumNotificationStatus = {
    UNREAD: 'unread',
    READ: 'read',
    ARCHIVED: 'archived',
    DELETED: 'deleted',
    SENT: 'sent',
    FAILED: 'failed',
    PENDING: 'pending',
} as const
export const PgEnumNotificationStatus = pgEnum('notification_status', Object.values(EnumNotificationStatus) as [string, ...string[]]);

export const EnumNotificationPriority = {
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high',
    CRITICAL: 'critical',
    ERROR: 'error',
} as const
export const PgEnumNotificationPriority = pgEnum('notification_priority', Object.values(EnumNotificationPriority) as [string, ...string[]]);

export const EnumJobStatus = {
    PENDING: 'pending',
    RUNNING: 'running',
    SUCCESS: 'success',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
} as const;

export const PgEnumJobStatus = pgEnum('job_status', Object.values(EnumJobStatus) as [string, ...string[]]);

export const EnumJobTrigger = {
    SYSTEM: 'system',
    MANUAL: 'manual',
    API: 'api',
} as const;

export const PgEnumJobTrigger = pgEnum('job_trigger', Object.values(EnumJobTrigger) as [string, ...string[]]);

export const EnumJobGroup = {
    DEFAULT: 'default',
    DAILY: 'daily',
    MAINTENANCE: 'maintenance',
    INTEGRATION: 'integration',
    REPORT: 'report',
} as const;

export const PgEnumJobGroup = pgEnum('job_group', Object.values(EnumJobGroup) as [string, ...string[]]);
