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
    const data = await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}`,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.1),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)]" />

      <div className="w-full max-w-md relative">
        {/* Card with glass morphism effect */}
        <div className="bg-card/80 backdrop-blur-xl rounded-xl shadow-xl border border-border/50 p-8 space-y-6 relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />

          {/* Header */}
          <div className="text-center space-y-0">
            <a href="/">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl">
                <img src='/images/sicerdas-transparent-v1.png' className='' />
              </div>
              <div className="text-lg font-bold tracking-tight text-foreground mb-2">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t("app.appName")}
                </span>
              </div>
            </a>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              <span className="">
                {t("signIn.title")}
              </span>
            </h1>
            <p className="text-muted-foreground">
              {t("signIn.signInDescription")}
            </p>
          </div>

          {/* Sign in form */}
          <SignInForm
            onFormSubmit={onFormSubmit}
            loading={loginMutation.isPending}
            errorMessage={errorMessage}
            onGoogleSignIn={handleGoogleSignIn} // Pass Google sign in handler
          />
        </div>

        {/* Footer */}
        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {t('app.copyright')}</p>
        </div>
      </div>
    </div>
  )
}

export default LoginComponent