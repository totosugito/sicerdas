import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { SubmitHandler } from 'react-hook-form'
import { useEmailOtpVerifyForgetPasswordMutation, useEmailOtpForgetPasswordMutation } from "@/service/auth-api";
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Timer, Loader2 } from 'lucide-react';
import { OtpVerificationForm } from '@/components/pages/auth/otp-verification';
import { useState, useEffect } from 'react';
import { AppRoute } from '@/constants/app-route';
import { z } from 'zod';
import { APP_CONFIG } from '@/constants/config';
import { AuthHeader, AuthLayout } from '@/components/pages/auth';

// Timer duration in seconds (default 120 seconds = 2 minutes)
const TIMER_DURATION = APP_CONFIG.RESEND_OTP_DELAY || 120;

export const Route = createFileRoute('/_auth/otp-verification')({
  validateSearch: z.object({
    email: z.string().optional(),
  }),
  beforeLoad: ({ search }) => {
    // Redirect to sign in if no email is provided
    if (!search.email) {
      throw redirect({ to: AppRoute.auth.signIn.url });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(search.email)) {
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
  const emailOtpForgetPasswordMutation = useEmailOtpForgetPasswordMutation(); // For resending OTP
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [showTimer, setShowTimer] = useState<boolean>(true); // Show timer by default
  const [timer, setTimer] = useState<number>(TIMER_DURATION); // Use configurable timer duration
  const [canResend, setCanResend] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [resendSuccess, setResendSuccess] = useState<boolean>(false);

  // Timer effect
  useEffect(() => {
    // Countdown timer
    let interval: NodeJS.Timeout | null = null;
    if (showTimer && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => {
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

  const onFormSubmit: SubmitHandler<Record<string, any>> = (data) => {
    setErrorMessage(undefined);

    // First verify the OTP with the correct parameters
    emailOtpVerifyForgetPasswordMutation.mutate(
      { body: { email: search.email, otp: data.otp } },
      {
        onSuccess: (response: any) => {
          // If OTP is valid, navigate to reset password page with email and otp parameters
          if (response?.data?.valid) {
            navigate({
              to: AppRoute.auth.otpResetPassword.url,
              search: {
                email: search.email,
                otp: data.otp
              }
            });
          } else {
            setErrorMessage(response?.data?.message || t("otpVerification.invalidOtp"));
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

  // Function to resend OTP
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
          setTimer(TIMER_DURATION); // Reset timer to configured duration
          // Hide success message after 3 seconds
          setTimeout(() => {
            setResendSuccess(false);
          }, 3000);
        },
        onError: (error: Record<string, any>) => {
          const errorMsg = error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            t("otpVerification.resendOtpError");
          setErrorMessage(errorMsg);
        },
        onSettled: () => {
          setResendLoading(false);
        }
      }
    );
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Default OTP Verification Form View
  return (
    <AuthLayout>
      <AuthHeader
        icon={<ShieldCheck className="w-8 h-8 text-white" />}
        appName={t("app.appName")}
        title={t("otpVerification.title")}
        description={t("otpVerification.instructions")}
      />

      {/* OTP verification form */}
      <OtpVerificationForm
        onFormSubmit={onFormSubmit}
        loading={emailOtpVerifyForgetPasswordMutation.isPending}
        errorMessage={errorMessage}
        email={search.email}
      />

      {/* Timer and Resend OTP Section */}
      {showTimer && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
          {!canResend ? (
            // Show timer and waiting text
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {t("otpVerification.timerText")}
                </span>
              </div>
              <div className="font-mono text-sm">
                {formatTime(timer)}
              </div>
            </div>
          ) : (
            // Show resend text with click event when timer is done
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                Tidak mendapatkan code.{" "}
                <span
                  onClick={handleResendOtp}
                  className="text-primary hover:text-primary/80 font-medium cursor-pointer transition-colors"
                >
                  Kirim Ulang OTP
                </span>
              </span>
            </div>
          )}

          {resendSuccess && (
            <div className="mt-3 p-2 bg-green-500/10 border border-green-500/20 rounded text-green-700 dark:text-green-300 text-sm">
              {t("otpVerification.resendOtpSuccess")}
            </div>
          )}

          {resendLoading && (
            <div className="mt-3 flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("labels.sending")} ...
            </div>
          )}
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t("otpVerification.backToSignIn")}{" "}
          <a href={AppRoute.auth.signIn.url} className="text-primary hover:text-primary/80 font-medium transition-colors">
            {t("labels.signIn")}
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}

export default OtpVerificationComponent