import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { SubmitHandler } from 'react-hook-form'
import { useEmailOtpVerifyForgetPasswordMutation, useEmailOtpResetPasswordMutation } from "@/service/auth-api";
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { OtpVerificationForm, OtpVerificationFormValues } from '@/components/pages/auth/otp-verification';
import { useState } from 'react';
import { AppRoute } from '@/constants/app-route';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

export const Route = createFileRoute('/_auth/otp-verification')({
  validateSearch: z.object({
    email: z.string().optional(),
  }),
  beforeLoad: ({ search }) => {
    // Redirect to sign in if no email is provided
    if (!search.email) {
      throw redirect({ to: AppRoute.auth.signIn.url });
    }
  },
  component: OtpVerificationComponent,
})

function OtpVerificationComponent() {
  const { t } = useTranslation();
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  const emailOtpVerifyForgetPasswordMutation = useEmailOtpVerifyForgetPasswordMutation();
  const emailOtpResetPasswordMutation = useEmailOtpResetPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | undefined>(undefined);

  const onFormSubmit: SubmitHandler<OtpVerificationFormValues> = (data) => {
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    setIsSuccess(false);
    
    // First verify the OTP
    emailOtpVerifyForgetPasswordMutation.mutate(
      { body: { email: data.email, token: data.otp } },
      {
        onSuccess: (response: any) => {
          // If OTP is valid, store the email and show the reset password form
          if (response?.data?.valid) {
            setVerifiedEmail(data.email);
            setIsOtpVerified(true);
            setSuccessMessage(t("otpVerification.otpVerified"));
          } else {
            setErrorMessage(t("otpVerification.invalidOtp"));
          }
        },
        onError: (error: Record<string, any>) => {
          // Handle different types of errors
          const errorMsg = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message ||
                          t("otpVerification.verificationError");
          setErrorMessage(errorMsg);
        },
      }
    );
  }

  const onResetPasswordSubmit: SubmitHandler<{ password: string; confirmPassword: string }> = (data) => {
    if (!verifiedEmail) {
      setErrorMessage(t("otpVerification.emailNotVerified"));
      return;
    }

    if (data.password !== data.confirmPassword) {
      setErrorMessage(t("message.passwordsDoNotMatch"));
      return;
    }

    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    setIsSuccess(false);

    // Reset the password
    emailOtpResetPasswordMutation.mutate(
      { body: { email: verifiedEmail, otp: "", password: data.password } },
      {
        onSuccess: (response: any) => {
          // Store the success message from API response
          const message = response?.message || t("resetPassword.successMessage");
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

  // Show reset password form after OTP verification
  if (isOtpVerified && verifiedEmail) {
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
                <ShieldCheck className="w-8 h-8 text-white" />
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
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const password = formData.get('password') as string;
              const confirmPassword = formData.get('confirmPassword') as string;
              onResetPasswordSubmit({ password, confirmPassword });
            }} className="space-y-5">
              {errorMessage && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-destructive font-medium">{errorMessage}</div>
                </div>
              )}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    placeholder={t("resetPassword.newPasswordPlaceholder")}
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 h-12"
                  />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder={t("resetPassword.confirmPasswordPlaceholder")}
                    className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 h-12"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={emailOtpResetPasswordMutation.isPending}
              >
                {emailOtpResetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("labels.resettingPassword")}...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    {t("labels.resetPassword")}
                  </>
                )}
              </Button>
            </form>
            
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
    );
  }

  // Default OTP Verification Form View
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
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div className="text-lg font-bold tracking-tight text-foreground">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("app.appName")}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              <span className="">
                {t("otpVerification.title")}
              </span>
            </h1>
            <p className="text-muted-foreground">
              {t("otpVerification.instructions")}
            </p>
          </div>

          {/* OTP verification form */}
          <OtpVerificationForm 
            onFormSubmit={onFormSubmit} 
            loading={emailOtpVerifyForgetPasswordMutation.isPending} 
            errorMessage={errorMessage} 
            email={search.email}
          />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("otpVerification.backToSignIn")}{" "}
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

export default OtpVerificationComponent