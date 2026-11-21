import type { BaseResponse, PaginationMeta } from "@/api/types";
import type { EnumExamSessionMode, EnumExamSessionStatus } from "@/api/exam/types";

export type { BaseResponse, PaginationMeta };

export interface PublicSectionItemT {
  id: string;
  title: string;
  groupName: string | null;
  description: string | null;
  durationMinutes: number;
  totalQuestions: number;
  activeQuestions: number;
  order: number;
  userStatus: EnumExamSessionStatus | null;
  userMode: EnumExamSessionMode | null;
  bestTryoutScore: number | null;
}

export interface AdminSectionItemT {
  id: string;
  packageId: string;
  title: string;
  groupName: string | null;
  description: string | null;
  durationMinutes: number;
  order: number;
  isActive: boolean;
  versionId: number | null;
  questionLimit: number;
  isRandomItem: boolean;
  isRandomChoice: boolean;
  totalQuestions: number;
  activeQuestions: number;
  maxScore: number;
  packageName: string | null;
  parentPackageId: string | null;
  educationGradeId?: number | null;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminSectionDetailData = AdminSectionItemT;

export interface AdminSimpleSectionItemT {
  value: string;
  label: string;
}

export interface AdminSectionListParams {
  search?: string;
  packageId?: string;
  examType?: string[];
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface AdminSectionSimpleParams {
  search?: string;
  packageId?: string;
  page?: number;
  limit?: number;
  isActive?: boolean;
}

export interface CreateSectionParams {
  packageId: string;
  title: string;
  groupName?: string | null;
  description?: string | null;
  durationMinutes?: number;
  order?: number;
  isActive?: boolean;
  versionId?: number | null;
  questionLimit?: number;
  isRandomItem?: boolean;
  isRandomChoice?: boolean;
}

export interface UpdateSectionParams extends Partial<CreateSectionParams> {}

export interface ListSectionParams {
  packageId: string;
}

export interface SectionResponse<T = unknown> extends BaseResponse {
  data: T;
}

export type PublicListSectionsResponse = SectionResponse<PublicSectionItemT[]>;
export type AdminSectionDetailResponse = SectionResponse<AdminSectionDetailData>;
export type CreateSectionResponse = SectionResponse<{ id: string }>;

export interface PaginatedSectionListResponse<T> extends BaseResponse {
  data: {
    package: { packageId: string; packageName: string };
    items: T[];
    meta: PaginationMeta;
  };
}

export type AdminListSectionsResponse = PaginatedSectionListResponse<AdminSectionItemT>;

export interface PaginatedSectionSimpleListResponse extends BaseResponse {
  data: {
    items: AdminSimpleSectionItemT[];
    meta: PaginationMeta;
  };
}

export type UpdateSectionRequest = UpdateSectionParams & { id: string };

export interface SectionQuestionItem {
  id: string;
  content: any[];
  type: string;
  difficulty: string;
  subjectName: string | null;
  order: number;
}

export type ExamPackageSection = AdminSectionItemT;
export type SectionDetailItem = AdminSectionDetailData;
export type ExamPackageSectionResponse = SectionResponse;
export type ExamPackageSectionDetailResponse = AdminSectionDetailResponse;
export type ListSectionsResponse = AdminListSectionsResponse;
export type ListSectionRequest = AdminSectionListParams;
export type CreateSectionRequest = CreateSectionParams;
export type ListSectionSimpleRequest = AdminSectionSimpleParams;
export type ListSectionsSimpleResponse = PaginatedSectionSimpleListResponse;
export type SectionSimpleItem = AdminSimpleSectionItemT;
