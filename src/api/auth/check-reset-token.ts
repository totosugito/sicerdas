import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export const useCheckResetTokenQuery = (token: string | undefined) => {
    return useQuery({
        queryKey: ['checkResetToken', token],
        queryFn: async () => {
            if (!token) {
                throw new Error("Token is required");
            }

            const response = await fetchApi({
                method: "POST",
                url: AppApi.auth.checkResetToken,
                body: { token },
                headers: { 'Content-Type': 'application/json' }
            });
            return response;
        },
        enabled: !!token, // Only run the query if token exists
        retry: false, // Don't retry on failure
    });
};
