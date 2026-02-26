import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamPackageDetailResponse } from "../types";

export interface CreatePackageRequest {
    categoryId: string;
    title: string;
    examType: string;
    durationMinutes?: number;
    description?: string;
    requiredTier?: string;
    educationGradeId?: number;
    isActive?: boolean;
}

export const useCreatePackage = () => {
    return useMutation({
        mutationKey: ["admin-exam-packages-create"],
        mutationFn: async (body: CreatePackageRequest) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.exam.packages.admin.create,
                body,
                withCredentials: true,
            });
            return response as ExamPackageDetailResponse;
        },
    });
};
