import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Lock, AlertCircle, CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";
import { ResetPasswordForm } from "@/features/auth/otp-reset-password";
import { useState, useEffect } from "react";
import { AppRoute } from "@/constants/app-route";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Link } from "@tanstack/react-router";

import {
  useEmailOtpVerifyForgetPasswordMutation,
  useEmailOtpResetPasswordMutation,
} from "@/api/auth";
import { AuthHeader, AuthLayout } from "@/features/auth";

export const Route = createFileRoute("/(auth)/otp-reset-password")({
  validateSearch: z.object({
    email: z.string().optional(),
    otp: z.any().optional(),
  }),
  beforeLoad: ({ search }) => {
    if (!search.email || !search.otp) {
      throw redirect({ to: AppRoute.auth.signIn.url });
    }
  },
  component: ResetPasswordComponent,
});

function ResetPasswordComponent() {
  const { t } = useAppTranslation();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const emailOtpVerifyForgetPasswordMutation = useEmailOtpVerifyForgetPasswordMutation();
  const emailOtpResetPasswordMutation = useEmailOtpResetPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);

  useEffect(() => {
    if (search.email && search.otp) {
      emailOtpVerifyForgetPasswordMutation.mutate(
        { body: { email: search.email, otp: search.otp.toString() } },
        {
          onError: (error: Record<string, any>) => {
            const errorMsg = error?.message || t(($) => $.auth.resetPassword.errorMessage);
            setErrorMessage(errorMsg);
            setIsOtpInvalid(true);
          },
        },
      );
    }
  }, [search.email, search.otp]);

  const onFormSubmit = (data: Record<string, any>) => {
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    setIsSuccess(false);
    setIsOtpInvalid(false);

    const resetData = {
      email: search.email || "",
      otp: search.otp?.toString() || "",
      password: data.password,
    };

    emailOtpResetPasswordMutation.mutate(
      { body: resetData },
      {
        onSuccess: (res) => {
          const message = res?.message || t(($) => $.auth.resetPassword.successMessage);
          setSuccessMessage(message);
          setIsSuccess(true);
        },
        onError: (error) => {
          const errorMsg = error?.message || t(($) => $.auth.resetPassword.errorMessage);
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
          title={t(($) => $.auth.resetPassword.successTitle)}
        />
        <div className="text-center space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
            <p className="text-sm text-foreground leading-relaxed">
              {successMessage || t(($) => $.auth.resetPassword.successMessage)}
            </p>
          </div>

          <Button
            onClick={handleBackToLogin}
            className="w-full h-10 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <span>{t(($) => $.auth.resetPassword.backToSignIn)}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Error View (Invalid OTP / Fatal Error)
  if (errorMessage && isOtpInvalid) {
    return (
      <AuthLayout>
        <AuthHeader
          icon={<AlertCircle className="w-7 h-7 text-destructive" />}
          title={t(($) => $.auth.resetPassword.errorTitle)}
        />
        <div className="text-center space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5">
            <p className="text-sm text-destructive font-medium leading-relaxed">
              {errorMessage || t(($) => $.auth.resetPassword.errorMessage)}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Button
              onClick={() =>
                navigate({
                  to: AppRoute.auth.otpVerification.url,
                  search: { email: search.email },
                })
              }
              className="w-full h-10 rounded-xl font-semibold"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              {t(($) => $.auth.otpVerification.title)}
            </Button>
            <Button
              variant="outline"
              onClick={handleBackToLogin}
              className="w-full h-10 rounded-xl font-medium"
            >
              {t(($) => $.auth.resetPassword.backToSignIn)}
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
        icon={<Lock className="w-7 h-7 text-white" />}
        title={t(($) => $.auth.resetPassword.title)}
        description={t(($) => $.auth.resetPassword.instructions)}
      />

      <ResetPasswordForm
        onFormSubmit={onFormSubmit}
        loading={emailOtpResetPasswordMutation.isPending}
        errorMessage={errorMessage}
      />

      <div className="text-center pt-3 border-t border-border/40 mt-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t(($) => $.auth.resetPassword.backToSignIn)}{" "}
          <Link
            to={AppRoute.auth.signIn.url}
            className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline"
          >
            {t(($) => $.labels.signIn)}
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

