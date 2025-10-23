import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod'

import { SubmitHandler } from 'react-hook-form'
import {LoginFormValues} from "@/types/auth";
import {useLoginMutation} from "@/service/auth";
import { useTranslation } from 'react-i18next';
import { BookOpen } from 'lucide-react';
import { createSignInBodyParam, LoginForm } from '@/components/pages/auth/sign-in';

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

  const onFormSubmit: SubmitHandler<LoginFormValues> = (data) => {
    loginMutation.mutate(
      {body: createSignInBodyParam(data)},
      {
        onSuccess: (data: any) => {
          // if (data?.user?.role === EnumUserRole.admin) {
          //   navigate({to: AppRoute.dashboard.dashboard}).then(() => {
          //   })
          // } else {
            navigate({to: search.redirect || fallback})
          // }
        },
        onError: (error) => {
          //showNotifError({message: error?.message})
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4 relative">
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header section */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/15 dark:bg-primary/20 rounded-full mb-4 backdrop-blur-sm border border-primary/40 dark:border-primary/30">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
              {t("signIn.title")}
            </span>
          </h1>
          {/* <p className="text-muted-foreground text-lg mb-2">{t("login.subtitle")}</p> */}
          <p className="text-sm text-muted-foreground/80">{t("signIn.tagline")}</p>
        </div>

        {/* Login card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl transition-all hover:shadow-3xl hover:border-primary/30">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">{t("signIn.welcomeBack")}</h2>
            <p className="text-muted-foreground">{t("signIn.signInDescription")}</p>
          </div>

          <LoginForm onFormSubmit={onFormSubmit} loading={loginMutation.isPending}/>
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