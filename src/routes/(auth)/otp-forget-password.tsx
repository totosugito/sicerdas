import {
  createFileRoute,
} from '@tanstack/react-router'
import { SubmitHandler } from 'react-hook-form'
import { useEmailOtpForgetPasswordMutation } from "@/api/auth-api";
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { ForgetPasswordForm } from '@/components/pages/auth/otp-forget-password';
import { useState } from 'react';
import { AppRoute } from '@/constants/app-route';
import { Button } from '@/components/ui/button';
import { AuthHeader, AuthLayout } from '@/components/pages/auth';

export const Route = createFileRoute('/(auth)/otp-forget-password')({
  component: ForgetPasswordComponent,
})

function ForgetPasswordComponent() {
  const { t } = useTranslation();
  const navigate = Route.useNavigate()

  const emailOtpForgetPassowrdMutation = useEmailOtpForgetPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);

  const onFormSubmit: SubmitHandler<Record<string, any>> = (data) => {
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    setIsSuccess(false);
    emailOtpForgetPassowrdMutation.mutate(
      {
        body: data
      },
      {
        onSuccess: (responseData: any) => {
          // Store the success message from API response
          const message = responseData?.message || t("auth.forgetPassword.successMessage");
          setSuccessMessage(message);
          setIsSuccess(true);
          // Redirect to OTP verification page with email parameter from form data
          navigate({ to: AppRoute.auth.otpVerification.url, search: { email: data.email } });
        },
        onError: (error: Record<string, any>) => {
          // Handle different types of errors
          const errorMsg = error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            t("auth.forgetPassword.errorMessage");
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
          title={t("auth.forgetPassword.title")}
          description={""}
        />
        {/* Success card */}
        <div className="text-center space-y-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("auth.forgetPassword.successTitle")}</h2>
            <p className="text-muted-foreground">
              {successMessage || t("auth.forgetPassword.successMessage")}
            </p>
          </div>

          <Button onClick={handleBackToLogin} className="w-full h-12">
            {t("auth.forgetPassword.backToSignIn")}
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
          title={t("auth.forgetPassword.title")}
          description={""}
        />
        {/* Error card */}
        <div className="text-center space-y-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("auth.forgetPassword.failTitle")}</h2>
            <p className="text-sm text-destructive font-medium">{errorMessage || t("auth.forgetPassword.errorMessage")}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => setErrorMessage(undefined)} className="w-full">
              {t("auth.forgetPassword.tryAgain")}
            </Button>
            <Button variant="outline" onClick={handleBackToLogin} className="w-full">
              {t("auth.forgetPassword.backToSignIn")}
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Default Form View
  return (
    <AuthLayout>
      <AuthHeader
        icon={<Mail className="w-8 h-8 text-white" />}
        appName={t("app.appName")}
        title={t("auth.forgetPassword.title")}
        description={t("auth.forgetPassword.instructions")}
      />

      {/* Forgot password form */}
      <ForgetPasswordForm onFormSubmit={onFormSubmit} loading={emailOtpForgetPassowrdMutation.isPending} errorMessage={errorMessage} />

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t("auth.forgetPassword.backToSignIn")}{" "}
          <a href={AppRoute.auth.signIn.url} className="text-primary hover:text-primary/80 font-medium transition-colors">
            {t("labels.signIn")}
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}

export default ForgetPasswordComponent