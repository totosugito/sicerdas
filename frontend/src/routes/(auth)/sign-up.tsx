import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { useSignUpMutation } from "@/api/auth/sign-up";
import { useAppTranslation } from "@/lib/i18n-typed";
import { SignUpForm } from "@/features/auth/sign-up";
import { useState } from "react";
import { AppRoute } from "@/constants/app-route";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, UserPlus, ArrowRight, RotateCcw } from "lucide-react";
import { SignUpFormValues } from "@/features/auth/sign-up/SignUpForm";
import { AuthHeader, AuthLayout } from "@/features/auth";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)/sign-up")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || "/" });
    }
  },
  component: SignUpComponent,
});

function SignUpComponent() {
  const { t } = useAppTranslation();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const signUpMutation = useSignUpMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);

  const onFormSubmit = (data: SignUpFormValues) => {
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    setIsSuccess(false);
    signUpMutation.mutate(
      { body: data },
      {
        onSuccess: (data: any) => {
          const message = data?.message || t(($) => $.auth.signUp.signUpSuccessMessage);
          setSuccessMessage(message);
          setIsSuccess(true);
        },
        onError: (error: Record<string, any>) => {
          const errorMsg =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            t(($) => $.auth.signUp.signUpFailedMessage);
          setErrorMessage(errorMsg);
        },
      },
    );
  };

  const handleContinueToLogin = () => {
    navigate({ to: search.redirect ? search.redirect : AppRoute.auth.signIn.url });
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
          title={t(($) => $.auth.signUp.signUpSuccessTitle)}
        />
        <div className="text-center space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
            <p className="text-sm text-foreground leading-relaxed">
              {successMessage || t(($) => $.auth.signUp.signUpSuccessMessage)}
            </p>
          </div>

          <Button
            onClick={handleContinueToLogin}
            className="w-full h-10 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            <span>{t(($) => $.labels.signIn)}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Error View (when there's a standalone fatal error)
  if (errorMessage && !signUpMutation.isPending && errorMessage.includes("fatal")) {
    return (
      <AuthLayout>
        <AuthHeader
          icon={<AlertCircle className="w-7 h-7 text-destructive" />}
          title={t(($) => $.auth.signUp.signUpFailedTitle)}
        />
        <div className="text-center space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-5">
            <p className="text-sm text-destructive font-medium leading-relaxed">
              {errorMessage || t(($) => $.auth.signUp.signUpFailedMessage)}
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Button
              onClick={() => setErrorMessage(undefined)}
              className="w-full h-10 rounded-xl font-semibold"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              {t(($) => $.auth.signUp.tryAgain)}
            </Button>
            <Button
              variant="outline"
              onClick={handleBackToLogin}
              className="w-full h-10 rounded-xl font-medium"
            >
              {t(($) => $.labels.signIn)}
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
        icon={<UserPlus className="w-7 h-7 text-white" />}
        title={t(($) => $.auth.signUp.title)}
        description={t(($) => $.auth.signUp.signUpDescription)}
      />

      <SignUpForm
        onFormSubmit={onFormSubmit}
        loading={signUpMutation.isPending}
        errorMessage={errorMessage}
      />
    </AuthLayout>
  );
}

