import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useMutation } from "@tanstack/react-query";
import { ExamPackageResponse } from "../types";

export const useDeletePackage = () => {
    return useMutation({
        mutationKey: ["admin-exam-packages-delete"],
        mutationFn: async (id: string) => {
            const response = await fetchApi({
                method: "DELETE",
                url: AppApi.exam.packages.admin.delete.replace(":id", id),
                withCredentials: true,
            });
            return response as ExamPackageResponse;
        },
    });
};
