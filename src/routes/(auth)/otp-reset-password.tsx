import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { ResetPasswordForm } from '@/components/pages/auth/otp-reset-password';
import { useState, useEffect } from 'react';
import { AppRoute } from '@/constants/app-route';
import { Button } from '@/components/ui/button';
import { z } from 'zod';

// Add the import for the OTP verification mutation and OTP reset password mutation
import { useEmailOtpVerifyForgetPasswordMutation, useEmailOtpResetPasswordMutation } from "@/api/auth-api";
import { AuthHeader, AuthLayout } from '@/components/pages/auth';

export const Route = createFileRoute('/(auth)/otp-reset-password')({
  validateSearch: z.object({
    email: z.string().optional(),
    otp: z.any().optional(), // Add otp parameter
  }),
  beforeLoad: ({ search }) => {
    // Redirect to sign in if no token or email is provided
    if (!search.email || !search.otp) {
      throw redirect({ to: AppRoute.auth.signIn.url });
    }
  },
  component: ResetPasswordComponent,
})

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

  const onFormSubmit: SubmitHandler<Record<string, any>> = (data) => {
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
          const message = data?.message || t("auth.resetPassword.successMessage");
          setSuccessMessage(message);
          setIsSuccess(true);
        },
        onError: (error: Record<string, any>) => {
          // Handle different types of errors
          const errorMsg = error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            t("auth.resetPassword.errorMessage");
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
      <AuthLayout>
        <AuthHeader
          icon={<CheckCircle className="w-8 h-8 text-white" />}
          appName={t("app.appName")}
          title={t("auth.resetPassword.title")}
          description={""}
        />
        {/* Success card */}
        <div className="text-center space-y-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("auth.resetPassword.successTitle")}</h2>
            <p className="text-muted-foreground">
              {successMessage || t("auth.resetPassword.successMessage")}
            </p>
          </div>

          <Button onClick={handleBackToLogin} className="w-full">
            {t("auth.resetPassword.backToSignIn")}
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Error View (when there's an error but not success)
  if (errorMessage) {
    return (
      <AuthLayout>
        <AuthHeader
          icon={<AlertCircle className="w-8 h-8 text-white" />}
          appName={t("app.appName")}
          title={t("auth.resetPassword.title")}
          description={""}
        />
        {/* Error card */}
        <div className="text-center space-y-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("auth.resetPassword.errorTitle")}</h2>
            <p className="text-sm text-destructive font-medium">{errorMessage || t("auth.resetPassword.errorMessage")}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => setErrorMessage(undefined)} className="w-full">
              {t("auth.resetPassword.tryAgain")}
            </Button>
            <Button variant="outline" onClick={handleBackToLogin} className="w-full">
              {t("auth.resetPassword.backToSignIn")}
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Default Form View - only show if token is valid
  return (
    <AuthLayout>
      <AuthHeader
        icon={<Lock className="w-8 h-8 text-white" />}
        appName={t("app.appName")}
        title={t("auth.resetPassword.title")}
        description={t("auth.resetPassword.instructions")}
      />

      {/* Reset password form */}
      <ResetPasswordForm onFormSubmit={onFormSubmit} loading={emailOtpResetPasswordMutation.isPending} errorMessage={errorMessage} />

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t("auth.resetPassword.backToSignIn")}{" "}
          <a href={AppRoute.auth.signIn.url} className="text-primary hover:text-primary/80 font-medium transition-colors">
            {t("labels.signIn")}
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}

export default ResetPasswordComponent