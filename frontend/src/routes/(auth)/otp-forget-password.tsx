import { createFileRoute } from "@tanstack/react-router";
import { useEmailOtpForgetPasswordMutation } from "@/api/auth/email-otp-forget-password";
import type {
  EmailOtpForgetPasswordRequest,
  EmailOtpForgetPasswordResponse,
  BaseResponse,
} from "@/api/auth/types";

import { useAppTranslation } from "@/lib/i18n-typed";
import { AlertCircle, CheckCircle2, Mail, ArrowRight, RotateCcw } from "lucide-react";
import { ForgetPasswordForm } from "@/features/auth/otp-forget-password";
import { useState } from "react";
import { AppRoute } from "@/constants/app-route";
import { Button } from "@/components/ui/button";
import { AuthHeader, AuthLayout } from "@/features/auth";

export const Route = createFileRoute("/(auth)/otp-forget-password")({
  component: ForgetPasswordComponent,
});

function ForgetPasswordComponent() {
  const { t } = useAppTranslation();
  const navigate = Route.useNavigate();

  const emailOtpForgetPassowrdMutation = useEmailOtpForgetPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);

  const onFormSubmit = (data: EmailOtpForgetPasswordRequest) => {
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    setIsSuccess(false);
    emailOtpForgetPassowrdMutation.mutate(
      {
        body: data,
      },
      {
        onSuccess: (responseData: EmailOtpForgetPasswordResponse) => {
          const message = responseData?.message || t(($) => $.auth.forgetPassword.successMessage);
          setSuccessMessage(message);
          setIsSuccess(true);
          navigate({ to: AppRoute.auth.otpVerification.url, search: { email: data.email } });
        },
        onError: (error: BaseResponse) => {
          const errorMsg = error?.message || t(($) => $.auth.forgetPassword.errorMessage);
          setErrorMessage(errorMsg);
        },
      },
    );
  };

  const handleBackToLogin = () => {
    navigate({ to: AppRoute.auth.signIn.url });
  };

  // Success View
  if (isSuccess) {
    return (
      <AuthLayout>
        <AuthHeader
          icon={<CheckCircle2 className="w-7 h-7 text-emerald-500" />}
          title={t(($) => $.auth.forgetPassword.successTitle)}
        />
        <div className="text-center space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
            <p className="text-sm text-foreground leading-relaxed">
              {successMessage || t(($) => $.auth.forgetPassword.successMessage)}
            </p>
          </div>

          <Button
            onClick={handleBackToLogin}
            className="w-full h-10 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <span>{t(($) => $.auth.forgetPassword.backToSignIn)}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Error View
  if (errorMessage && !emailOtpForgetPassowrdMutation.isPending && errorMessage.includes("fatal")) {
    return (
      <AuthLayout>
        <AuthHeader
          icon={<AlertCircle className="w-7 h-7 text-destructive" />}
          title={t(($) => $.auth.forgetPassword.failTitle)}
        />
        <div className="text-center space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5">
            <p className="text-sm text-destructive font-medium leading-relaxed">
              {errorMessage || t(($) => $.auth.forgetPassword.errorMessage)}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Button
              onClick={() => setErrorMessage(undefined)}
              className="w-full h-10 rounded-xl font-semibold"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              {t(($) => $.auth.forgetPassword.tryAgain)}
            </Button>
            <Button
              variant="outline"
              onClick={handleBackToLogin}
              className="w-full h-10 rounded-xl font-medium"
            >
              {t(($) => $.auth.forgetPassword.backToSignIn)}
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
        icon={<Mail className="w-7 h-7 text-white" />}
        title={t(($) => $.auth.forgetPassword.title)}
        description={t(($) => $.auth.forgetPassword.instructions)}
      />

      <ForgetPasswordForm
        onFormSubmit={onFormSubmit}
        loading={emailOtpForgetPassowrdMutation.isPending}
        errorMessage={errorMessage}
      />
    </AuthLayout>
  );
}

