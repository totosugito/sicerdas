import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { FormPassword } from "@/components/forms";
import { Loader2, Lock, Check, AlertCircle } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

type Props = {
  onFormSubmit: (values: Record<string, any>) => void;
  loading?: boolean;
  errorMessage?: string;
};

export const ResetPasswordForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useAppTranslation();

  const resetPasswordFormData = {
    form: {
      password: {
        type: "password",
        name: "password",
        label: t(($) => $.labels.newPassword),
        placeholder: t(($) => $.auth.resetPassword.newPasswordPlaceholder),
      },
      confirmPassword: {
        type: "password",
        name: "confirmPassword",
        label: t(($) => $.labels.confirmPassword),
        placeholder: t(($) => $.auth.resetPassword.confirmPasswordPlaceholder),
      },
    },
    defaultValue: {
      password: "",
      confirmPassword: "",
    } satisfies ResetPasswordFormValues,
  };

  const schema = z
    .object({
      password: z.string().min(1, { message: t(($) => $.message.passwordRequired) }),
      confirmPassword: z
        .string()
        .min(1, { message: t(($) => $.message.confirmPasswordRequired) }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t(($) => $.message.passwordsDoNotMatch),
      path: ["confirmPassword"],
    });

  const form = useAppForm({
    defaultValues: resetPasswordFormData.defaultValue,
    validators: {
      onChange: schema,
    },
    onSubmit({ value }) {
      onFormSubmit({
        password: value.password ?? "",
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
        className="space-y-4"
      >
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3.5 flex items-start gap-2.5 text-sm animate-in fade-in-50 duration-200">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="font-medium text-xs sm:text-sm">{errorMessage}</div>
          </div>
        )}

        <div className="space-y-3.5">
          <form.AppField name="password">
            {(field) => (
              <FormPassword
                field={field}
                item={resetPasswordFormData.form.password}
                leftIcon={<Lock />}
                className="h-10 rounded-xl bg-background/50 focus:bg-background transition-colors"
                showMessage={true}
              />
            )}
          </form.AppField>

          <form.AppField name="confirmPassword">
            {(field) => (
              <FormPassword
                field={field}
                item={resetPasswordFormData.form.confirmPassword}
                leftIcon={<Check />}
                className="h-10 rounded-xl bg-background/50 focus:bg-background transition-colors"
                showMessage={true}
              />
            )}
          </form.AppField>
        </div>

        <Button
          type="submit"
          className="w-full h-10 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.99] mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t(($) => $.labels.resettingPassword)}...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              {t(($) => $.labels.resetPassword)}
            </>
          )}
        </Button>
      </form>
    </form.AppForm>
  );
};

