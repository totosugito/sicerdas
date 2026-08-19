import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { LoginFormValues } from "@/types/auth";
import { FormInput, FormPassword } from "@/components/forms";
import { Loader2, Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { AppRoute } from "@/constants/app-route";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { APP_CONFIG } from "@/constants/config";

type Props = {
  onFormSubmit: (values: FormData) => void;
  loading?: boolean;
  errorMessage?: string;
  onGoogleSignIn?: () => void;
};

export const SignInForm = ({ onFormSubmit, loading, errorMessage, onGoogleSignIn }: Props) => {
  const { t } = useAppTranslation();

  const signInFormData = {
    form: {
      email: {
        type: "text",
        name: "email",
        label: t(($) => $.labels.emailAddress),
        placeholder: t(($) => $.auth.signIn.emailPlaceholder),
      },
      password: {
        type: "password",
        name: "password",
        label: t(($) => $.labels.password),
        placeholder: t(($) => $.auth.signIn.passwordPlaceholder),
      },
    },
    defaultValue: {
      email: APP_CONFIG.demoUser.email,
      password: APP_CONFIG.demoUser.password,
    } satisfies LoginFormValues,
  };

  const schema = z.object({
    email: z.email({ message: t(($) => $.auth.signIn.invalidEmail) }),
    password: z.string().min(1, { message: t(($) => $.auth.signIn.passwordRequired) }),
  });

  const form = useAppForm({
    defaultValues: signInFormData.defaultValue,
    validators: {
      onChange: schema,
    },
    onSubmit({ value }) {
      const values = new FormData();
      values.append("email", value.email ?? "");
      values.append("password", value.password ?? "");
      onFormSubmit(values);
    },
  });

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3.5 flex items-start gap-2.5 text-sm animate-in fade-in-50 duration-200">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="font-medium text-xs sm:text-sm">{errorMessage}</div>
          </div>
        )}

        <div className="space-y-3.5">
          <form.AppField name="email">
            {(field) => (
              <FormInput
                field={field}
                item={signInFormData.form.email}
                leftIcon={<Mail />}
                className="h-10 rounded-xl bg-background/50 focus:bg-background transition-colors"
                showMessage={true}
              />
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <FormPassword
                field={field}
                item={signInFormData.form.password}
                leftIcon={<Lock />}
                className="h-10 rounded-xl bg-background/50 focus:bg-background transition-colors"
                showMessage={true}
              />
            )}
          </form.AppField>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
          <label className="flex items-center space-x-2 text-muted-foreground hover:text-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-border text-primary focus:ring-primary/40"
            />
            <span>{t(($) => $.labels.rememberMe)}</span>
          </label>
          <Link
            to={AppRoute.auth.otpForgetPassword.url}
            className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
          >
            {t(($) => $.labels.forgetPassword)}
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-10 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.99] mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t(($) => $.labels.signIn)}...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              {t(($) => $.labels.signIn)}
            </>
          )}
        </Button>

        {/* Google Sign In Button */}
        {onGoogleSignIn && (
          <div className="space-y-3 pt-2">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-card px-2.5 text-muted-foreground font-medium">
                  {t(($) => $.auth.signIn.orContinueWith)}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-10 rounded-xl font-medium border-border/80 hover:bg-accent/60 transition-all active:scale-[0.99]"
              onClick={onGoogleSignIn}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              {t(($) => $.auth.signIn.continueWithGoogle)}
            </Button>
          </div>
        )}

        <div className="text-center pt-3 border-t border-border/40">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t(($) => $.auth.signIn.newUser)}{" "}
            <Link
              to={AppRoute.auth.signUp.url}
              className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline"
            >
              {t(($) => $.labels.signUp)}
            </Link>
          </p>
        </div>
      </form>
    </form.AppForm>
  );
};