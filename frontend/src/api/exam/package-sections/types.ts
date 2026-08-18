import type {
  PublicSectionItemT,
  AdminSectionItemT,
  AdminSectionDetailData,
  AdminSimpleSectionItemT,
  AdminSectionListParams,
  AdminSectionSimpleParams,
  CreateSectionParams,
  UpdateSectionParams,
  ListSectionParams,
} from "backend/src/modules/exam/package-sections/index.ts";
import type { BaseResponse, PaginationMeta } from "backend/src/types/index.ts";

export type {
  PublicSectionItemT,
  AdminSectionItemT,
  AdminSectionDetailData,
  AdminSimpleSectionItemT,
  AdminSectionListParams,
  AdminSectionSimpleParams,
  CreateSectionParams,
  UpdateSectionParams,
  ListSectionParams,
  BaseResponse,
  PaginationMeta,
};

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
