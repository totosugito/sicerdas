import { EnumExamPackageUserStatus as UserStatusValues } from "backend/src/db/schema/exam/enums";

export type EnumExamPackageUserStatus = (typeof UserStatusValues)[keyof typeof UserStatusValues];

export interface ExamPackage {
  id: string;
  title: string;
  examType: string;
  durationMinutes: number;
  thumbnail: string | null;
  description: string | null;
  requiredTier: string | null;
  isActive: boolean;
  isNew: boolean;
  versionId: number | null;
  category: {
    id: string;
    name: string | null;
    key: string | null;
  };
  grade: {
    id: number | null;
    name: string | null;
  };
  stats: {
    totalSections?: number;
    activeSections: number;
    totalQuestions?: number;
    activeQuestions: number;
    viewCount: number;
    likeCount: number;
    bookmarkCount: number;
    rating: number;
    ratingCount: number;
  };
  userInteraction?: {
    liked: boolean;
    disliked: boolean;
    rating: number;
    bookmarked: boolean;
    status: EnumExamPackageUserStatus;
    completedSectionsCount: number;
    viewCount?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ExamPackageResponse {
  success: boolean;
  message: string;
}

export interface ExamPackageDetailResponse extends ExamPackageResponse {
  data: ExamPackage;
}

export interface GradeStats {
  id: number;
  name: string;
  stats: {
    activeCount: number;
    totalCount: number;
  };
}

export interface FilterParamsItem {
  id: string;
  name: string;
  key: string;
  description: string | null;
  grades: GradeStats[];
}

export interface ExamFilterParamsResponse extends ExamPackageResponse {
  data: FilterParamsItem[];
}

export interface GenerateCustomRequest {
  categoryId: string;
  educationGradeId: number;
  tagIds: string[];
  limit?: number;
  packageTitle?: string;
  sectionTitle?: string;
}

export interface GenerateCustomResponse extends ExamPackageResponse {
  data: {
    packageId: string;
    sectionId: string;
  };
}

export interface CustomPracticeItem {
  id: string;
  title: string;
  thumbnail: string | null;
  durationMinutes: number;
  stats: {
    activeQuestions: number;
    activeSections: number;
  };
  category: {
    name: string;
  };
  grade: {
    name: string;
  };
  userInteraction: {
    status: EnumExamPackageUserStatus;
    completedSectionsCount: number;
  };
  createdAt: string;
}

export interface ListCustomPackagesResponse extends ExamPackageResponse {
  data: CustomPracticeItem[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
