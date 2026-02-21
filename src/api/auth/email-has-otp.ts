import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

export const useEmailHasOtpQuery = (email: string | undefined) => {
    return useQuery({
        queryKey: ['emailHasOtp', email],
        queryFn: async () => {
            if (!email) {
                throw new Error("Email is required");
            }

            const response = await fetchApi({
                method: "POST",
                url: AppApi.auth.emailHasOtp,
                body: { email },
                headers: { 'Content-Type': 'application/json' }
            });
            return response;
        },
        enabled: !!email, // Only run the query if email exists
        retry: false, // Don't retry on failure
    });
};
