import { useMutation } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";
import { EnumContentType, EnumReportReason } from "backend/src/db/schema/enum-app";

export interface CreateReportBody {
    name: string;
    email: string;
    title: string;
    contentType: (typeof EnumContentType)[keyof typeof EnumContentType];
    referenceId: string;
    reason: (typeof EnumReportReason)[keyof typeof EnumReportReason];
    description?: string;
    extra?: Record<string, unknown>;
}

export const useCreateReportMutation = () => {
    return useMutation({
        mutationKey: ['createReport'],
        mutationFn: async ({ body }: { body: CreateReportBody }) => {
            const response = await fetchApi({
                method: "POST",
                url: AppApi.report.create,
                body: body,
                headers: { 'Content-Type': 'application/json' }
            });
            return response;
        },
    });
};
