import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod'
import { SubmitHandler } from 'react-hook-form'
import { useSignUpMutation } from "@/service/auth-api";
import { useTranslation } from 'react-i18next';
import { SignUpForm } from '@/components/pages/auth/sign-up';
import { useState } from 'react';
import { AppRoute } from '@/constants/app-route';
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, UserPlus } from 'lucide-react';
import { SignUpFormValues } from '@/components/pages/auth/sign-up/SignUpForm';
import { AuthHeader, AuthLayout } from '@/components/pages/auth';

export const Route = createFileRoute('/_auth/sign-up')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || '/' })
    }
  },
  component: SignUpComponent,
})

function SignUpComponent() {
  const { t } = useTranslation();
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  const signUpMutation = useSignUpMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [isSuccess, setIsSuccess] = useState(false);

  const onFormSubmit: SubmitHandler<SignUpFormValues> = (data) => {
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    setIsSuccess(false);
    signUpMutation.mutate(
      { body: data },
      {
        onSuccess: (data: any) => {
          // Store the success message from API response
          const message = data?.message || t("auth.signUp.signUpSuccessMessage");
          setSuccessMessage(message);
          setIsSuccess(true);
        },
        onError: (error: Record<string, any>) => {
          // Handle different types of errors
          const errorMsg = error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            t("auth.signUp.signUpFailedMessage");
          setErrorMessage(errorMsg);
        },
      }
    );
  }

  const handleContinueToLogin = () => {
    // Redirect to the intended destination or sign-in page
    navigate({ to: search.redirect ? search.redirect : AppRoute.auth.signIn.url })
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
          title={t("auth.signUp.title")}
          description={""}
        />
        {/* Success card */}
        <div className="text-center space-y-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("auth.signUp.signUpSuccessTitle")}</h2>
            <p className="text-muted-foreground">
              {successMessage || t("auth.signUp.signUpSuccessMessage")}
            </p>
          </div>

          <Button onClick={handleContinueToLogin} className="w-full">
            {t("labels.signIn")}
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
          title={t("auth.signUp.title")}
          description={""}
        />
        {/* Error card */}
        <div className="text-center space-y-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("auth.signUp.signUpFailedTitle")}</h2>
            <p className="text-sm text-destructive font-medium">{errorMessage || t("auth.signUp.signUpFailedMessage")}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => setErrorMessage(undefined)} className="w-full">
              {t("auth.signUp.tryAgain")}
            </Button>
            <Button variant="outline" onClick={handleBackToLogin} className="w-full">
              {t("labels.signIn")}
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
        icon={<UserPlus className="w-8 h-8 text-white" />}
        appName={t("app.appName")}
        title={t("auth.signUp.title")}
        description={t("auth.signUp.signUpDescription")}
      />

      {/* Sign up form */}
      <SignUpForm onFormSubmit={onFormSubmit} loading={signUpMutation.isPending} errorMessage={errorMessage} />

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t("auth.signUp.alreadyHaveAccount")}{" "}
          <a href={AppRoute.auth.signIn.url} className="text-primary hover:text-primary/80 font-medium transition-colors">
            {t("labels.signIn")}
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}

export default SignUpComponent