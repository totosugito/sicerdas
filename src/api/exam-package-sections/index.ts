export type {
  ExamPackageSection,
  ExamPackageSectionResponse,
  ExamPackageSectionDetailResponse,
} from "./types";

// Admin exports
export { useCreatePackageSection } from "./admin/create-section";
export type { CreateSectionRequest } from "./admin/create-section";

export { useUpdatePackageSection } from "./admin/update-section";
export type { UpdateSectionRequest } from "./admin/update-section";

export { useDeletePackageSection } from "./admin/delete-section";

// public exports
export { useListPackageSection } from "./admin/list-section";
export type { ListSectionRequest, ListSectionsResponse } from "./admin/list-section";

export { useListPackageSectionSimple } from "./admin/list-section-simple";
export type {
  ListSectionSimpleRequest,
  ListSectionsSimpleResponse,
  SectionSimpleItem,
} from "./admin/list-section-simple";

export { useDetailPackageSection } from "./admin/detail-section";
