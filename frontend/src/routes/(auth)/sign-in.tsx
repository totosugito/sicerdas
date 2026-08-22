import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

import { useLoginMutation, type LoginResponse } from "@/api/auth/login";
import { useAppTranslation } from "@/lib/i18n-typed";
import { SignInForm } from "@/features/auth/sign-in";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { isAdminString } from "@/types/auth";
import { APP_CONFIG } from "@/constants/config";
import { AuthHeader, AuthLayout } from "@/features/auth";
import { LogIn } from "lucide-react";

const fallback = "/" as const;
export const Route = createFileRoute("/(auth)/sign-in")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || fallback });
    }
  },
  component: LoginComponent,
});

function LoginComponent() {
  const { t } = useAppTranslation();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const loginMutation = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const onFormSubmit = (data: import("@/types/auth").LoginFormValues) => {
    setErrorMessage(undefined);
    loginMutation.mutate(
      { body: data },
      {
        onSuccess: (response: LoginResponse) => {
          if (response.success) {
            const defaultPath = isAdminString(response.user.role || "")
              ? APP_CONFIG.path.defaultAdmin
              : APP_CONFIG.path.defaultPrivate;
            navigate({ to: search.redirect || defaultPath });
          } else {
            setErrorMessage(response.message || t(($) => $.labels.error));
          }
        },
        onError: (error) => {
          setErrorMessage(error?.message || t(($) => $.labels.error));
        },
      },
    );
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}`,
    });
  };

  return (
    <AuthLayout>
      <AuthHeader
        icon={<LogIn className="w-7 h-7 text-white" />}
        title={t(($) => $.auth.signIn.welcomeBack)}
        description={t(($) => $.auth.signIn.signInDescription)}
      />

      <SignInForm
        onFormSubmit={onFormSubmit}
        loading={loginMutation.isPending}
        errorMessage={errorMessage}
        onGoogleSignIn={handleGoogleSignIn}
      />
    </AuthLayout>
  );
}

