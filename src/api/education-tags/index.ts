export type { ExamTag, ExamTagDetailData, ExamTagResponse, ExamTagDetailResponse } from "./types";

// Admin exports
export { useListTag } from "./list-tag";
export type { ListTagRequest, ListTagResponse } from "./list-tag";

export { useCreateTag } from "./admin/create-tag";
export type { CreateTagRequest } from "./admin/create-tag";

export { useUpdateTag } from "./admin/update-tag";
export type { UpdateTagRequest } from "./admin/update-tag";

export { useDeleteTag } from "./admin/delete-tag";
export { useListTagSimple } from "./list-tag-simple";
export type { TagSimpleItem, ListTagsSimpleResponse, ListTagSimpleRequest } from "./list-tag-simple";
