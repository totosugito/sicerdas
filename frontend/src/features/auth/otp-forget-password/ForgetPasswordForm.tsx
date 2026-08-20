import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms";
import { Loader2, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { APP_CONFIG } from "@/constants/config";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";

type Props = {
  onFormSubmit: (values: { email: string; redirectTo?: string }) => void;
  loading?: boolean;
  errorMessage?: string;
};

export type ForgetPasswordFormValues = {
  email: string;
};

export const ForgetPasswordForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useAppTranslation();

  const forgetPasswordFormData = {
    form: {
      email: {
        type: "text",
        name: "email",
        label: t(($) => $.auth.forgetPassword.emailAddress),
        placeholder: t(($) => $.auth.forgetPassword.emailPlaceholder),
      },
    },
    defaultValue: {
      email: APP_CONFIG.demoUser.email,
    } satisfies ForgetPasswordFormValues,
  };

  const schema = z.object({
    email: z.email({ message: t(($) => $.auth.forgetPassword.invalidEmail) }),
  });

  const form = useAppForm({
    defaultValues: forgetPasswordFormData.defaultValue,
    validators: {
      onChange: schema,
    },
    onSubmit({ value }) {
      const values = {
        email: value.email ?? "",
        redirectTo: `${window.location.origin}/reset-password`,
      };
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
                item={forgetPasswordFormData.form.email}
                leftIcon={<Mail />}
                className="h-10 rounded-md bg-background/50 focus:bg-background transition-colors"
                labelClassName="pl-0"
                showMessage={true}
              />
            )}
          </form.AppField>
        </div>

        <Button
          type="submit"
          className="w-full font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.99] mt-2"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t(($) => $.labels.forgetPassword)}...
            </>
          ) : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" />
              {t(($) => $.labels.forgetPassword)}
            </>
          )}
        </Button>

        <div className="text-center pt-3 border-t border-border/40">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t(($) => $.auth.forgetPassword.backToSignIn)}{" "}
            <Link
              to={AppRoute.auth.signIn.url}
              className="text-primary hover:text-primary/80 font-semibold transition-colors hover:underline"
            >
              {t(($) => $.labels.signIn)}
            </Link>
          </p>
        </div>
      </form>
    </form.AppForm>
  );
};