export const EnumLectureType = {
  VIDEO: "video",
  EXAM: "exam",
  TEXT: "text",
  PDF: "pdf",
  DISCUSSION: "discussion",
  OTHER: "other",
} as const;
export type EnumLectureType = (typeof EnumLectureType)[keyof typeof EnumLectureType];

export const EnumEnrollmentStatus = {
  ACTIVE: "active",
  COMPLETED: "completed",
  DROPPED: "dropped",
} as const;
export type EnumEnrollmentStatus =
  (typeof EnumEnrollmentStatus)[keyof typeof EnumEnrollmentStatus];
