import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { EducationGradeDetailResponse } from "../types";

export interface UpdateEducationGradeRequest {
    id: number;
    name?: string;
    desc?: string;
    extra?: any;
}

export const useUpdateEducationGrade = () => {
    return useMutation({
        mutationKey: ["admin-education-grade-update"],
        mutationFn: async ({ id, ...body }: UpdateEducationGradeRequest) => {
            const response = await fetchApi({
                method: "PUT",
                url: AppApi.educationGrade.admin.update.replace(":id", id.toString()),
                body,
                withCredentials: true,
            });
            return response as EducationGradeDetailResponse;
        },
    });
};
