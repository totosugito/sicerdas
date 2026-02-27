import { AppApi } from "@/constants/app-api";
import { fetchApi } from "@/lib/fetch-api";
import { useQuery } from "@tanstack/react-query";
import { ExamPackageDetailResponse } from "./types";

export interface DetailPackageRequest {
    id: string;
}

export const useDetailPackage = ({ id }: DetailPackageRequest) => {
    return useQuery({
        queryKey: ["exam-packages-detail", id],
        queryFn: async () => {
            const response = await fetchApi({
                method: "GET",
                url: AppApi.exam.packages.detail.replace(":id", id),
                withCredentials: true,
            });
            return response as ExamPackageDetailResponse;
        },
        enabled: !!id,
    });
};
