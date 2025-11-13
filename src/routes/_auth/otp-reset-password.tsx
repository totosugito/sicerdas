import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { ResetPasswordForm, ResetPasswordFormValues } from '@/components/pages/auth/otp-reset-password';
import { useState, useEffect } from 'react';
import { AppRoute } from '@/constants/app-route';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

// Add the import for the OTP verification mutation and OTP reset password mutation
import { useEmailOtpVerifyForgetPasswordMutation, useEmailOtpResetPasswordMutation } from "@/service/auth-api";

export const Route = createFileRoute('/_auth/otp-reset-password')({
  validateSearch: z.object({
    email: z.string().optional(),
    otp: z.any().optional(), // Add otp parameter
  }),
  beforeLoad: ({ search }) => {
    // Redirect to sign in if no token or email is provided
    if (!search.email && !search.otp) {
      throw redirect({ to: AppRoute.auth.signIn.url });
    }
  },
  component: ResetPasswordComponent,
})

// Extract the common layout to reduce duplication
const AuthLayout = ({ children, t }: { children: React.ReactNode; t: ReturnType<typeof useTranslation>["t"] }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.1),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)]" />
    
    <div className="w-full max-w-md relative">
      {/* Card with glass morphism effect */}
      <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 p-8 space-y-6 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
        {children}
      </div>
      <div className="text-center mt-6 text-sm text-muted-foreground/70">
        <p>© {new Date().getFullYear()} {t("app.footerCopyright")}</p>
      </div>
    </div>
  </div>
);

// Extract the common header to reduce duplication
const AuthHeader = ({ icon, appName, title }: { icon: React.ReactNode; appName: string; title: string }) => (
  <div className="text-center space-y-2">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-0 shadow-lg">
      {icon}
    </div>
    <div className="text-lg font-bold tracking-tight text-foreground">
      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {appName}
      </span>
    </div>
    <h1 className="text-3xl font-bold tracking-tight text-foreground">
      <span className="">
        {title}
      </span>
    </h1>
  </div>
);

function ResetPasswordComponent() {
  const { t } = useTranslation();
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  // Add OTP verification mutation
  const emailOtpVerifyForgetPasswordMutation = useEmailOtpVerifyForgetPasswordMutation();
  // Add OTP reset password mutation
  const emailOtpResetPasswordMutation = useEmailOtpResetPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);

  // Add effect to verify OTP when component mounts
  useEffect(() => {
    // Only run if we have both email and otp
    if (search.email && search.otp) {
      emailOtpVerifyForgetPasswordMutation.mutate(
        { body: { email: search.email, otp: search.otp.toString() } },
        {
          onError: (error: Record<string, any>) => {
            // Navigate to OTP verification page if verification fails
            navigate({ 
              to: AppRoute.auth.otpVerification.url, 
              search: { email: search.email } 
            });
          },
        }
      );
    }
  }, [search.email, search.otp]);

  const onFormSubmit: SubmitHandler<ResetPasswordFormValues> = (data) => {
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    setIsSuccess(false);
    
    // Prepare the data with email, otp, and password
    const resetData = {
      email: search.email,
      otp: search.otp.toString(),
      password: data.password
    };
    
    emailOtpResetPasswordMutation.mutate(
      { body: resetData },
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

  
  // Success View
  if (isSuccess) {
    return (
      <AuthLayout t={t}>
        <AuthHeader 
          icon={<CheckCircle className="w-8 h-8 text-white" />}
          appName={t("app.appName")}
          title={t("resetPassword.title")}
        />
        {/* Success message */}
        <div className="text-center space-y-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("resetPassword.successTitle")}</h2>
            <p className="text-muted-foreground">
              {successMessage || t("resetPassword.successMessage")}
            </p>
          </div>
          
          <Button onClick={handleBackToLogin} className="w-full h-12">
            {t("resetPassword.backToSignIn")}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Error View (when there's an error but not success)
  if (errorMessage) {
    return (
      <AuthLayout t={t}>
        <AuthHeader 
          icon={<AlertCircle className="w-8 h-8 text-white" />}
          appName={t("app.appName")}
          title={t("resetPassword.title")}
        />
        {/* Error message */}
        <div className="text-center space-y-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("resetPassword.errorTitle")}</h2>
            <p className="text-sm text-destructive font-medium">{errorMessage || t("resetPassword.errorMessage")}</p>
          </div>
          
          <Button onClick={handleBackToLogin} className="w-full h-12">
            {t("resetPassword.backToSignIn")}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Default Form View - only show if token is valid
  return (
    <AuthLayout t={t}>
      <AuthHeader 
        icon={<Lock className="w-8 h-8 text-white" />}
        appName={t("app.appName")}
        title={t("resetPassword.title")}
      />
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          {t("resetPassword.instructions")}
        </p>
      </div>

      {/* Reset password form */}
      <ResetPasswordForm onFormSubmit={onFormSubmit} loading={emailOtpResetPasswordMutation.isPending} errorMessage={errorMessage} />
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t("resetPassword.backToSignIn")}{" "}
          <a href={AppRoute.auth.signIn.url} className="text-primary hover:text-primary/80 font-medium transition-colors">
            {t("labels.signIn")}
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}

export default ResetPasswordComponent