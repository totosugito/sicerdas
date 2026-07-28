import { pgEnum } from "drizzle-orm/pg-core";

// Course Status Enum
export const EnumCourseStatus = {
    DRAFT: 'draft',  // plan to publish on the future
    PUBLISHED: 'published', // published
    FINISHED: 'finished', // finished
    ARCHIVED: 'archived', // save as archied to as history
    DELETED: 'deleted' // deleted from db
} as const;
export const PgEnumCourseStatus = pgEnum('course_status', Object.values(EnumCourseStatus) as [string, ...string[]]);



export const EnumPublishDateType = {
    NOW: 'now',
    DATE: 'date',
} as const;
export const PgEnumPublishDateType = pgEnum('publish_date_type', Object.values(EnumPublishDateType) as [string, ...string[]]);

export const EnumLectureType = {
    VIDEO: 'video',
    EXAM: 'exam',
    TEXT: 'text',
    PDF: 'pdf',
    DISCUSSION: 'discussion',
    OTHER: 'other'
} as const;

export const PgEnumLectureType = pgEnum('lecture_type', Object.values(EnumLectureType) as [string, ...string[]]);

export const EnumEnrollmentStatus = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    DROPPED: 'dropped'
} as const;
export const PgEnumEnrollmentStatus = pgEnum('enrollment_status', Object.values(EnumEnrollmentStatus) as [string, ...string[]]);