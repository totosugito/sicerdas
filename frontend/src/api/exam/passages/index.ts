export {
    type ExamPassage,
    type PassageFormValues,
    type PassageResponseItemT,
    type ListPassagesResponse,
    type ListPassagesSimpleResponse,
    type PassageDetailResponse,
    type CreatePassageParams,
    type UpdatePassageParams,
    type PassageListParams,
    type PassageSimpleListParams,
} from "./types";

export { useListPassage } from "./admin/list-passage";
export { useListPassageSimple } from "./admin/list-passage-simple";
export { useCreatePassage } from "./admin/create-passage";
export { useGetPassage } from "./admin/get-passage";
export { useUpdatePassage, type UpdatePassageRequest } from "./admin/update-passage";
export { useDeletePassage } from "./admin/delete-passage";
