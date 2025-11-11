import {
  createFileRoute,
} from '@tanstack/react-router'
import { SubmitHandler } from 'react-hook-form'
import { useSignUpMutation } from "@/service/auth-api";
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { SignUpForm, SignUpFormValues, createSignUpBodyParam } from '@/components/pages/auth/sign-up';
import { useState } from 'react';
import { AppRoute } from '@/constants/app-route';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';

export const Route = createFileRoute('/_auth/sign-up')({
  component: SignUpComponent,
})

function SignUpComponent() {
  const { t } = useTranslation();
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  const signUpMutation = useSignUpMutation();
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const onFormSubmit: SubmitHandler<SignUpFormValues> = (data) => {
    setErrorMessage(undefined);
    signUpMutation.mutate(
      { body: createSignUpBodyParam(data) },
      {
        onSuccess: (data: any) => {
          // Show success dialog instead of redirecting immediately
          setShowSuccessDialog(true);
        },
        onError: (error: Record<string, any>) => {
          // Handle different types of errors
          const errorMsg = error?.response?.data?.message || 
                          error?.response?.data?.error || 
                          error?.message ||
                          t("signUp.signUpFailed");
          setErrorMessage(errorMsg);
        },
      }
    );
  }

  const handleContinueToLogin = () => {
    setShowSuccessDialog(false);
    // Redirect to the intended destination or sign-in page
    navigate({ to: search.redirect ? search.redirect : AppRoute.auth.signIn.url })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-background to-cyan-50 flex items-center justify-center p-4 relative dark:from-emerald-950/30 dark:to-cyan-950/30">
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header section */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full mb-4 backdrop-blur-sm border border-emerald-500/40 dark:border-emerald-500/30">
            {/* <UserPlus className="w-10 h-10 text-emerald-500" /> */}
            <img src='/images/sicerdas-transparent-v1.png' className='p-2'/>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              {t("signUp.title")}
            </span>
          </h1>
          {/* <p className="text-sm text-muted-foreground/80">{t("signUp.tagline")}</p> */}
        </div>

        {/* Sign Up card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl transition-all hover:shadow-3xl hover:border-emerald-500/30">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">{t("signUp.createAccount")}</h2>
            <p className="text-muted-foreground">{t("signUp.signUpDescription")}</p>
          </div>

          <SignUpForm onFormSubmit={onFormSubmit} loading={signUpMutation.isPending} errorMessage={errorMessage} />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("signUp.alreadyHaveAccount")}{" "}
              <a href={AppRoute.auth.signIn.url} className="text-emerald-600 hover:text-emerald-500 font-medium transition-colors dark:text-emerald-400 dark:hover:text-emerald-300">
                {t("labels.signIn")}
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground/70">
          <p>© {new Date().getFullYear()} {t("signUp.footerCopyright")}</p>
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
              {t("signUp.signUpSuccessTitle")}
            </DialogTitle>
            <DialogDescription className="text-center">
              {t("signUp.signUpSuccessMessage")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleContinueToLogin} className="w-full">
              {t("labels.signIn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SignUpComponent