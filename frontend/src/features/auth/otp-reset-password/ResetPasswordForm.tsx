import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { FormPassword } from "@/components/forms";
import { Loader2, Lock, Check, AlertCircle } from "lucide-react";
import { useAppTranslation } from '@/lib/i18n-typed';
import { z } from "zod";

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

type Props = {
  onFormSubmit: (values: Record<string, any>) => void;
  loading?: boolean,
  errorMessage?: string,
}

export const ResetPasswordForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useAppTranslation();

  // Define resetPasswordFormData directly in this file
  const resetPasswordFormData = {
    form: {
      password: {
        type: "password",
        name: "password",
        label: t($ => $.labels.newPassword),
        placeholder: t($ => $.auth.resetPassword.newPasswordPlaceholder),
      },
      confirmPassword: {
        type: "password",
        name: "confirmPassword",
        label: t($ => $.labels.confirmPassword),
        placeholder: t($ => $.auth.resetPassword.confirmPasswordPlaceholder),
      }
    },
    defaultValue: {
      password: "",
      confirmPassword: "",
    } satisfies ResetPasswordFormValues
  };

  // Create schema with translated error messages directly in this file
  const schema = z.object({
    password: z.string().min(1, { message: t($ => $.message.passwordRequired) }),
    confirmPassword: z.string().min(1, { message: t($ => $.message.confirmPasswordRequired) })
  }).refine((data) => data.password === data.confirmPassword, {
    message: t($ => $.message.passwordsDoNotMatch),
    path: ["confirmPassword"],
  });

  const form = useAppForm({
    defaultValues: resetPasswordFormData.defaultValue,
    validators: {
      onChange: schema,
    },
    onSubmit({ value }) {
      onFormSubmit({
        password: value.password ?? ""
      });
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
        className="space-y-5"
      >
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-destructive font-medium">{errorMessage}</div>
          </div>
        )}
        <div className="space-y-4">
          <div className="relative">
            <form.AppField name="password">
              {(field) => (
                <FormPassword
                  field={field}
                  item={resetPasswordFormData.form.password}
                  className="pl-10"
                  showMessage={false}
                />
              )}
            </form.AppField>
            <Lock className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
          </div>
          <div className="relative">
            <form.AppField name="confirmPassword">
              {(field) => (
                <FormPassword
                  field={field}
                  item={resetPasswordFormData.form.confirmPassword}
                  className="pl-10"
                  showMessage={false}
                />
              )}
            </form.AppField>
            <Check className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t($ => $.labels.resettingPassword)}...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              {t($ => $.labels.resetPassword)}
            </>
          )}
        </Button>
      </form>
    </form.AppForm>
  )
}
