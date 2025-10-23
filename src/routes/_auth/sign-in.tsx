import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod'

import { SubmitHandler } from 'react-hook-form'
import { LoginFormValues } from "@/types/auth";
import { useLoginMutation } from "@/service/auth-api";
import { useTranslation } from 'react-i18next';
import { LogIn } from 'lucide-react';
import { createSignInBodyParam, SignInForm } from '@/components/pages/auth/sign-in';
import { useState } from 'react';

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

  const onFormSubmit: SubmitHandler<LoginFormValues> = (data) => {
    setErrorMessage(undefined);
    loginMutation.mutate(
      { body: createSignInBodyParam(data) },
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50 flex items-center justify-center p-4 relative dark:from-blue-950/30 dark:to-indigo-950/30">
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header section */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/15 dark:bg-blue-500/20 rounded-full mb-4 backdrop-blur-sm border border-blue-500/40 dark:border-blue-500/30">
            {/* <LogIn className="w-10 h-10 text-blue-500" /> */}
            <img src='/images/sicerdas-transparent-v1.png' className='p-2'/>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t("signIn.title")}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground/80">{t("signIn.tagline")}</p>
        </div>

        {/* Login card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl transition-all hover:shadow-3xl hover:border-blue-500/30">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">{t("signIn.welcomeBack")}</h2>
            <p className="text-muted-foreground">{t("signIn.signInDescription")}</p>
          </div>

          <SignInForm onFormSubmit={onFormSubmit} loading={loginMutation.isPending} errorMessage={errorMessage} />
          
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground/70">
          <p>© {new Date().getFullYear()} {t("signIn.footerCopyright")}</p>
        </div>
      </div>
    </div>
  )
}

export default LoginComponent