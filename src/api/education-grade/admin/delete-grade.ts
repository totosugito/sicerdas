import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { EducationGradeResponse } from "../types";

export const useDeleteEducationGrade = () => {
    return useMutation({
        mutationKey: ["admin-education-grade-delete"],
        mutationFn: async (id: number) => {
            const response = await fetchApi({
                method: "DELETE",
                url: AppApi.educationGrade.admin.delete.replace(":id", id.toString()),
                withCredentials: true,
            });
            return response as EducationGradeResponse;
        },
    });
};
