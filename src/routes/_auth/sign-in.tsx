import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod'

import { SubmitHandler } from 'react-hook-form'
import { useLoginMutation } from "@/service/auth-api";
import { useTranslation } from 'react-i18next';
import { SignInForm } from '@/components/pages/auth/sign-in'; // Updated import path
import { useState } from 'react';
import { authClient } from '@/lib/auth-client'; // Import authClient for social login
import { AuthHeader, AuthLayout } from '@/components/pages/auth';
import { LogIn } from 'lucide-react';

const fallback = '/' as const
export const Route = createFileRoute('/_auth/sign-in')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || fallback })
    }
  },
  component: LoginComponent,
})

function LoginComponent() {
  const { t } = useTranslation();
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  const loginMutation = useLoginMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const onFormSubmit: SubmitHandler<FormData> = (data) => {
    setErrorMessage(undefined);
    loginMutation.mutate(
      { body: data },
      {
        onSuccess: (data: any) => {
          navigate({ to: search.redirect || fallback })
        },
        onError: (error: Record<string, any>) => {
          setErrorMessage(error?.response?.data?.message || error?.response?.data?.error || error?.message)
        },
      }
    );
  }

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}`,
    });
  }

  return (
    <AuthLayout>
      <AuthHeader
        icon={<img src="/images/sicerdas-transparent-v1.png" alt="Logo" />}
        appName={t("app.appName")}
        title={t("signIn.title")}
        description={t("signIn.signInDescription")}
      />
      
      {/* Sign in form */}
      <SignInForm
        onFormSubmit={onFormSubmit}
        loading={loginMutation.isPending}
        errorMessage={errorMessage}
        onGoogleSignIn={handleGoogleSignIn} // Pass Google sign in handler
      />
    </AuthLayout>
  )
}

export default LoginComponent