export type { ExamPackage, ExamPackageResponse, ExamPackageDetailResponse } from "./types";

// Admin exports
export { useCreatePackage } from "./admin/create-package";
export type { CreatePackageRequest } from "./admin/create-package";

export { useUpdatePackage } from "./admin/update-package";
export type { UpdatePackageRequest } from "./admin/update-package";

export { useDeletePackage } from "./admin/delete-package";

// public exports
export { useListPackage } from "./admin/list-package";
export type { ListPackageRequest, ListPackagesResponse } from "./admin/list-package";
export { useListPackageSimple } from "./admin/list-package-simple";
export type { ListPackagesSimpleResponse, PackageSimpleItem } from "./admin/list-package-simple";

export { useDetailPackage } from "./admin/detail-package";
export type { DetailPackageRequest } from "./admin/detail-package";

export { useUploadPackageThumbnail } from "./admin/upload-thumbnail";
export type { UploadThumbnailRequest } from "./admin/upload-thumbnail";

// Client exports
export { useListPackageClient } from "./client/list-package";
export type { ListPackageClientRequest, ListPackagesClientResponse } from "./client/list-package";

export { useDetailPackageClient } from "./client/detail-package";
export type { DetailPackageClientRequest } from "./client/detail-package";

export { useBookmarkPackage } from "./client/bookmark-package";
export type { BookmarkPackageRequest, BookmarkPackageResponse } from "./client/bookmark-package";
