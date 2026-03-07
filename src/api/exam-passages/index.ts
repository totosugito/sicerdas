export {
    type ExamPassage,
    type ExamPassageResponse,
    type ExamPassageDetailResponse,
    type PassageFormValues
} from "./types";
export { useListPassage, type ListPassageRequest, type ListPassagesResponse } from "./admin/list-passage";
export { useListPassageSimple, type ListPassageSimpleRequest, type ListPassageSimpleResponse } from "./admin/list-passage-simple";
export { useCreatePassage, type CreatePassageRequest } from "./admin/create-passage";
export { useGetPassage } from "./admin/get-passage";
export { useUpdatePassage, type UpdatePassageRequest } from "./admin/update-passage";
export { useDeletePassage } from "./admin/delete-passage";
