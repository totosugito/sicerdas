import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { EducationGradeDetailResponse } from "../types";

export interface CreateEducationGradeRequest {
    grade: string;
    name: string;
    desc?: string;
    extra?: any;
}

export const useCreateEducationGrade = () => {
    return useMutation({
        mutationKey: ["admin-education-grade-create"],
        mutationFn: async (body: CreateEducationGradeRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.educationGrade.admin.create,
                body,
                withCredentials: true,
            });
            return response as EducationGradeDetailResponse;
        },
    });
};
