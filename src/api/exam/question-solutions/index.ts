export {
    type QuestionSolutionResponseItemT,
    type ListQuestionSolutionsResponse,
    type QuestionSolutionDetailResponse,
    type CreateQuestionSolutionParams,
    type UpdateQuestionSolutionParams,
    type QuestionSolutionListParams,
} from "./types";

export { useListQuestionSolution } from "./admin/list-solution";
export { useCreateQuestionSolution, type CreateQuestionSolutionRequest } from "./admin/create-solution";
export { useUpdateQuestionSolution, type UpdateQuestionSolutionRequest } from "./admin/update-solution";
export { useDeleteQuestionSolution, useDeleteMultipleQuestionSolutions } from "./admin/delete-solution";
