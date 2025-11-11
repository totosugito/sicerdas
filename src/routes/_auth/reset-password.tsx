import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { SubmitHandler } from 'react-hook-form'
import { useResetPasswordMutation, useCheckResetTokenQuery } from "@/service/auth-api";
import { useTranslation } from 'react-i18next';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { ResetPasswordForm, ResetPasswordFormValues, createResetPasswordBodyParam } from '@/components/pages/auth/reset-password';
import { useState, useEffect } from 'react';
import { AppRoute } from '@/constants/app-route';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

export const Route = createFileRoute('/_auth/reset-password')({
  validateSearch: z.object({
    token: z.string().optional(),
  }),
  beforeLoad: ({ search }) => {
    // Redirect to sign in if no token is provided
    if (!search.token) {
      throw redirect({ to: AppRoute.auth.signIn.url });
    }
  },
  component: ResetPasswordComponent,
})

function ResetPasswordComponent() {
  const { t } = useTranslation();
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  // Check token validity
  const tokenCheckQuery = useCheckResetTokenQuery(search.token);
  const resetPasswordMutation = useResetPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);

  // Handle token validation errors
  useEffect(() => {
    if (tokenCheckQuery.isError) {
      const error = tokenCheckQuery.error as any;
      const errorMsg = error?.response?.data?.message || 
                      error?.response?.data?.error || 
                      error?.message ||
                      t("resetPassword.invalidToken");
      setErrorMessage(errorMsg);
    }
  }, [tokenCheckQuery.isError, tokenCheckQuery.error, t]);

  const onFormSubmit: SubmitHandler<ResetPasswordFormValues> = (data) => {
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    setIsSuccess(false);
    
    // Add token to the data
    const dataWithToken = {
      ...data,
      token: search.token
    };
    
    resetPasswordMutation.mutate(
      { body: createResetPasswordBodyParam(dataWithToken) },
      {
        onSuccess: (data: any) => {
          // Store the success message from API response
          const message = data?.message || t("resetPassword.successMessage");
          setSuccessMessage(message);
          setIsSuccess(true);
        },
        onError: (error: Record<string, any>) => {
          // Handle different types of errors
          const errorMsg = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message ||
                          t("resetPassword.errorMessage");
          setErrorMessage(errorMsg);
        },
      }
    );
  }

  const handleBackToLogin = () => {
    navigate({ to: AppRoute.auth.signIn.url });
  }

  // Show loading state while checking token
  if (tokenCheckQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.1),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="relative z-10 w-full max-w-md">
          {/* Header section */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-0 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="text-lg font-bold tracking-tight text-foreground">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("app.appName")}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              <span className="">
                {t("resetPassword.title")}
              </span>
            </h1>
          </div>

          {/* Loading card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl transition-all">
            <div className="text-center mb-6">
              {/* <h2 className="text-2xl font-semibold text-foreground mb-2">{t("resetPassword.title")}</h2> */}
              <p className="text-muted-foreground">
                {t("resetPassword.validatingToken")}
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-muted-foreground/70">
            <p>© {new Date().getFullYear()} {t("app.footerCopyright")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Success View
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.1),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="relative z-10 w-full max-w-md">
          {/* Header section */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-0 shadow-lg">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div className="text-lg font-bold tracking-tight text-foreground">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("app.appName")}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              <span className="">
                {t("resetPassword.title")}
              </span>
            </h1>
          </div>

          {/* Success card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl transition-all">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">{t("resetPassword.successTitle")}</h2>
              <p className="text-muted-foreground">
                {successMessage || t("resetPassword.successMessage")}
              </p>
            </div>
            
            <Button onClick={handleBackToLogin} className="w-full h-12">
              {t("resetPassword.backToSignIn")}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-muted-foreground/70">
            <p>© {new Date().getFullYear()} {t("app.footerCopyright")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error View (when there's an error but not success)
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.1),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="relative z-10 w-full max-w-md">
          {/* Header section */}
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-0 shadow-lg">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <div className="text-lg font-bold tracking-tight text-foreground">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("app.appName")}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              <span className="">
                {t("resetPassword.title")}
              </span>
            </h1>
          </div>

          {/* Error card */}
          <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl transition-all">
            <div className="text-center mb-6">
              {/* <h2 className="text-2xl font-semibold text-foreground mb-2">{t("resetPassword.title")}</h2> */}
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start space-x-2 mb-4">
                <div className="text-sm text-destructive font-medium">{errorMessage}</div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* <Button onClick={() => setErrorMessage(undefined)} className="w-full h-12">
                {t("resetPassword.tryAgain")}
              </Button> */}
              <Button onClick={handleBackToLogin} className="w-full h-12">
                {t("resetPassword.backToSignIn")}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 text-sm text-muted-foreground/70">
            <p>© {new Date().getFullYear()} {t("app.footerCopyright")}</p>
          </div>
        </div>
      </div>
    );
  }

  // Default Form View - only show if token is valid
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.1),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)]" />
      
      <div className="w-full max-w-md relative">
        {/* Card with glass morphism effect */}
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 p-8 space-y-6 relative overflow-hidden">
          {/* Subtle gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
          
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-0 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="text-lg font-bold tracking-tight text-foreground">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("app.appName")}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              <span className="">
                {t("resetPassword.title")}
              </span>
            </h1>
            <p className="text-muted-foreground">
              {t("resetPassword.instructions")}
            </p>
          </div>

          {/* Reset password form */}
          <ResetPasswordForm onFormSubmit={onFormSubmit} loading={resetPasswordMutation.isPending} errorMessage={errorMessage} />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("resetPassword.backToSignIn")}{" "}
              <a href={AppRoute.auth.signIn.url} className="text-primary hover:text-primary/80 font-medium transition-colors">
                {t("labels.signIn")}
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-muted-foreground/70">
          <p>© {new Date().getFullYear()} {t("app.footerCopyright")}</p>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordComponent