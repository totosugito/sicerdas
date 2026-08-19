import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  useEmailOtpVerifyForgetPasswordMutation,
  useEmailOtpForgetPasswordMutation,
  useEmailHasOtpQuery,
} from "@/api/auth";
import type { EmailOtpVerifyForgetPasswordResponse, BaseResponse } from "@/api/auth/types";

import { useAppTranslation } from "@/lib/i18n-typed";
import { ShieldCheck, Timer, Loader2, RotateCcw } from "lucide-react";
import { OtpVerificationForm } from "@/features/auth/otp-verification";
import { useState, useEffect } from "react";
import { AppRoute } from "@/constants/app-route";
import { z } from "zod";
import { APP_CONFIG } from "@/constants/config";
import { AuthHeader, AuthLayout } from "@/features/auth";
import NotFoundError from "@/components/general/NotFoundError";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

const TIMER_DURATION = APP_CONFIG.RESEND_OTP_DELAY || 120;

export const Route = createFileRoute("/(auth)/otp-verification")({
  validateSearch: z.object({
    email: z.string().optional(),
  }),
  beforeLoad: ({ search }) => {
    if (!search.email) {
      throw redirect({ to: AppRoute.auth.signIn.url });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(search.email)) {
      throw redirect({ to: AppRoute.auth.signIn.url });
    }
  },
  component: OtpVerificationComponent,
});

function OtpVerificationComponent() {
  const { t } = useAppTranslation();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const emailHasOtpQuery = useEmailHasOtpQuery(search.email);
  const emailOtpVerifyForgetPasswordMutation = useEmailOtpVerifyForgetPasswordMutation();
  const emailOtpForgetPasswordMutation = useEmailOtpForgetPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [showTimer, setShowTimer] = useState<boolean>(true);
  const [timer, setTimer] = useState<number>(TIMER_DURATION);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (showTimer && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval as NodeJS.Timeout);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showTimer, timer]);

  if (
    (emailHasOtpQuery.isSuccess && emailHasOtpQuery.data && !emailHasOtpQuery.data.hasOtp) ||
    emailHasOtpQuery.isError
  ) {
    return <NotFoundError />;
  }

  if (emailHasOtpQuery.isLoading) {
    return (
      <AuthLayout>
        <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {t(($) => $.auth.otpVerification.checkingPending)}
          </p>
        </div>
      </AuthLayout>
    );
  }

  const onFormSubmit = (data: { otp: string }) => {
    setErrorMessage(undefined);

    emailOtpVerifyForgetPasswordMutation.mutate(
      { body: { email: search.email || "", otp: data.otp } },
      {
        onSuccess: (response: EmailOtpVerifyForgetPasswordResponse) => {
          if (response?.data?.valid) {
            navigate({
              to: AppRoute.auth.otpResetPassword.url,
              search: {
                email: search.email,
                otp: data.otp,
              },
            });
          } else {
            setErrorMessage(response?.message || t(($) => $.auth.otpVerification.invalidOtp));
          }
        },
        onError: (error: BaseResponse) => {
          const errorMsg = error?.message || t(($) => $.auth.otpVerification.verificationError);
          setErrorMessage(errorMsg);
        },
      },
    );
  };

  const handleResendOtp = () => {
    if (!search.email) return;

    setResendLoading(true);
    setResendSuccess(false);
    setErrorMessage(undefined);

    emailOtpForgetPasswordMutation.mutate(
      { body: { email: search.email } },
      {
        onSuccess: () => {
          setResendSuccess(true);
          setCanResend(false);
          setTimer(TIMER_DURATION);
          setTimeout(() => {
            setResendSuccess(false);
          }, 3000);
        },
        onError: (error: BaseResponse) => {
          const errorMsg = error?.message || t(($) => $.auth.otpVerification.resendOtpError);
          setErrorMessage(errorMsg);
        },
        onSettled: () => {
          setResendLoading(false);
        },
      },
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AuthLayout>
      <AuthHeader
        icon={<ShieldCheck className="w-7 h-7 text-white" />}
        title={t(($) => $.auth.otpVerification.title)}
        description={t(($) => $.auth.otpVerification.instructions)}
      />

      <OtpVerificationForm
        onFormSubmit={onFormSubmit}
        loading={emailOtpVerifyForgetPasswordMutation.isPending}
        errorMessage={errorMessage}
        email={search.email}
      />

      {/* Timer and Resend OTP Section */}
      {showTimer && (
        <div className="mt-4 p-3.5 bg-muted/40 rounded-xl border border-border/60 text-xs">
          {!canResend ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="h-4 w-4 text-primary" />
                <span>{t(($) => $.auth.otpVerification.timerText)}</span>
              </div>
              <div className="font-mono font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                {formatTime(timer)}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">
                {t(($) => $.auth.otpVerification.didNotGetCode)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResendOtp}
                disabled={resendLoading}
                className="text-primary font-semibold hover:text-primary/80 h-7 px-2"
              >
                {resendLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                )}
                {t(($) => $.auth.otpVerification.resendOtp)}
              </Button>
            </div>
          )}

          {resendSuccess && (
            <div className="mt-2.5 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 dark:text-emerald-400 text-center font-medium animate-in fade-in-50">
              {t(($) => $.auth.otpVerification.resendOtpSuccess)}
            </div>
          )}
        </div>
      )}

      <div className="text-center pt-4 border-t border-border/40 mt-4">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t(($) => $.auth.otpVerification.backToSignIn)}{" "}
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

