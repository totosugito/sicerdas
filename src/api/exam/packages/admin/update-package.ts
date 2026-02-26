import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamPackageResponse } from "../types";

export interface UpdatePackageRequest {
    id: string;
    categoryId?: string;
    title?: string;
    examType?: string;
    durationMinutes?: number;
    description?: string;
    requiredTier?: string;
    educationGradeId?: number;
    isActive?: boolean;
}

export const useUpdatePackage = () => {
    return useMutation({
        mutationKey: ["admin-exam-packages-update"],
        mutationFn: async ({ id, ...body }: UpdatePackageRequest) => {
            const response = await fetchApi({
                method: "PUT",
                url: AppApi.exam.packages.admin.update.replace(":id", id),
                body,
                withCredentials: true,
            });
            return response as ExamPackageResponse;
        },
    });
};
