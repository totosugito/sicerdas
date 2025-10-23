import {
  createFileRoute,
} from '@tanstack/react-router'
import { SubmitHandler } from 'react-hook-form'
import { useForgotPasswordMutation } from "@/service/auth-api";
import { useTranslation } from 'react-i18next';
import { MailQuestion } from 'lucide-react';
import { ForgotPasswordForm, ForgotPasswordFormValues, createForgotPasswordBodyParam } from '@/components/pages/auth/forgot-password';
import { useState } from 'react';
import { AppRoute } from '@/constants/app-route';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

export const Route = createFileRoute('/_auth/forgot-password')({
  component: ForgotPasswordComponent,
})

function ForgotPasswordComponent() {
  const { t } = useTranslation();
  const navigate = Route.useNavigate()

  const forgotPasswordMutation = useForgotPasswordMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const onFormSubmit: SubmitHandler<ForgotPasswordFormValues> = (data) => {
    setErrorMessage(undefined);
    setSuccessMessage(undefined);
    forgotPasswordMutation.mutate(
      { body: createForgotPasswordBodyParam(data) },
      {
        onSuccess: (data: any) => {
          // Store the success message from API response
          const message = data?.message || t("forgotPassword.successMessage");
          setSuccessMessage(message);
          // Show the success dialog
          setShowSuccessDialog(true);
        },
        onError: (error: Record<string, any>) => {
          // Handle different types of errors
          const errorMsg = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message ||
                          t("forgotPassword.errorMessage");
          setErrorMessage(errorMsg);
        },
      }
    );
  }

  const handleContinueToLogin = () => {
    setShowSuccessDialog(false);
    navigate({ to: AppRoute.auth.signIn.url });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-indigo-50 flex items-center justify-center p-4 relative dark:from-blue-950/30 dark:to-indigo-950/30">
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header section */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/15 dark:bg-blue-500/20 rounded-full mb-4 backdrop-blur-sm border border-blue-500/40 dark:border-blue-500/30">
            <MailQuestion className="w-10 h-10 text-blue-500" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {t("signIn.title")}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground/80">{t("forgotPassword.description")}</p>
        </div>

        {/* Forgot Password card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl transition-all hover:shadow-3xl hover:border-blue-500/30">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">{t("forgotPassword.title")}</h2>
            <p className="text-muted-foreground">{t("forgotPassword.instructions")}</p>
          </div>

          <ForgotPasswordForm 
            onFormSubmit={onFormSubmit} 
            loading={forgotPasswordMutation.isPending} 
            errorMessage={errorMessage}
          />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              <a href={AppRoute.auth.signIn.url} className="text-blue-600 hover:text-blue-500 font-medium transition-colors dark:text-blue-400 dark:hover:text-blue-300">
                {t("forgotPassword.backToSignIn")}
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground/70">
          <p>© {new Date().getFullYear()} {t("signIn.footerCopyright")}</p>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              {t("forgotPassword.title")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {successMessage || t("forgotPassword.successMessage")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Button onClick={handleContinueToLogin} className="w-full">
              {t("forgotPassword.backToSignIn")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ForgotPasswordComponent