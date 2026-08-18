import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";

export const useLogoutMutation = () => {
    const auth = useAuth();
    const router = useRouter();
    const navigate = useNavigate();

    return useMutation({
        mutationKey: ['logout'],
        mutationFn: async () => {
            auth.logout().then(() => {
                router.invalidate().finally(() => { });
            });

            authClient.signOut({
                fetchOptions: {
                    onSuccess: () => { },
                    onError: () => { },
                },
            });
            navigate({ to: '/' }).then(() => { });
        },
    });
};
