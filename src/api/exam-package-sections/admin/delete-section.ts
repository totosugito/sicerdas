import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamPackageSectionResponse } from "../types";

export const useDeletePackageSection = () => {
    return useMutation({
        mutationKey: ["admin-exam-package-sections-delete"],
        mutationFn: async (id: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: AppApi.exam.packageSections.admin.delete.replace(":id", id),
                withCredentials: true,
            });
            return response as ExamPackageSectionResponse;
        },
    });
};
