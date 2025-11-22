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

// Extract the common layout to reduce duplication
const AuthLayout = ({ children, t }: { children: React.ReactNode; t: ReturnType<typeof useTranslation>["t"] }) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.1),transparent_50%),radial-gradient(circle_at_70%_80%,hsl(var(--primary)/0.1),transparent_50%)]" />

    <div className="w-full max-w-md relative">
      {/* Card with glass morphism effect */}
      <div className="bg-card/80 backdrop-blur-xl rounded-xl shadow-xl border border-border/50 p-8 space-y-6 relative overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
        {children}
      </div>
      <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {t('app.copyright')}</p>
      </div>
    </div>
  </div>
);

// Extract the common header to reduce duplication
const AuthHeader = ({ icon, appName, title, description }: { icon: React.ReactNode; appName: string; title: string, description: string }) => (
  <div className="text-center space-y-0">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-0 shadow-lg">
      {icon}
    </div>
    <div className="text-lg font-bold tracking-tight text-foreground mb-2">
      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {appName}
      </span>
    </div>
    <h1 className="text-3xl font-bold tracking-tight text-foreground">
      <span className="">
        {title}
      </span>
    </h1>
    <p className="text-muted-foreground">
      {description}
    </p>
  </div>
);

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
          const message = data?.message || t("signUp.signUpSuccessMessage");
          setSuccessMessage(message);
          setIsSuccess(true);
        },
        onError: (error: Record<string, any>) => {
          // Handle different types of errors
          const errorMsg = error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            t("signUp.signUpFailedMessage");
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
      <AuthLayout t={t}>
        <AuthHeader
          icon={<CheckCircle className="w-8 h-8 text-white" />}
          appName={t("app.appName")}
          title={t("signUp.title")}
          description={""}
        />
        {/* Success card */}
        <div className="text-center space-y-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("signUp.signUpSuccessTitle")}</h2>
            <p className="text-muted-foreground">
              {successMessage || t("signUp.signUpSuccessMessage")}
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
      <AuthLayout t={t}>
        <AuthHeader
          icon={<AlertCircle className="w-8 h-8 text-white" />}
          appName={t("app.appName")}
          title={t("signUp.title")}
          description={""}
        />
        {/* Error card */}
        <div className="text-center space-y-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <h2 className="text-xl font-semibold text-foreground mb-2">{t("signUp.signUpFailedTitle")}</h2>
            <p className="text-sm text-destructive font-medium">{errorMessage || t("signUp.signUpFailedMessage")}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => setErrorMessage(undefined)} className="w-full">
              {t("signUp.tryAgain")}
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
    <AuthLayout t={t}>
      <AuthHeader
        icon={<UserPlus className="w-8 h-8 text-white" />}
        appName={t("app.appName")}
        title={t("signUp.title")}
        description={t("signUp.signUpDescription")}
      />

      {/* Sign up form */}
      <SignUpForm onFormSubmit={onFormSubmit} loading={signUpMutation.isPending} errorMessage={errorMessage} />

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t("signUp.alreadyHaveAccount")}{" "}
          <a href={AppRoute.auth.signIn.url} className="text-primary hover:text-primary/80 font-medium transition-colors">
            {t("labels.signIn")}
          </a>
        </p>
      </div>
    </AuthLayout>
  )
}

export default SignUpComponent