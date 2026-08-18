import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { useAppTranslation } from '@/lib/i18n-typed';
import { z } from "zod";
import { APP_CONFIG } from "@/constants/config";

type Props = {
  onFormSubmit: (values: { email: string; redirectTo?: string }) => void;
  loading?: boolean;
  errorMessage?: string;
};


// Define ForgetPasswordFormValues type directly in this file
export type ForgetPasswordFormValues = {
  email: string;
};

export const ForgetPasswordForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useAppTranslation();

  // Define forgetPasswordFormData directly in this file
  const forgetPasswordFormData = {
    form: {
      email: {
        type: "text",
        name: "email",
        label: t($ => $.auth.forgetPassword.emailAddress),
        placeholder: t($ => $.auth.forgetPassword.emailPlaceholder),
      }
    },
    defaultValue: {
      email: APP_CONFIG.demoUser.email,
    } satisfies ForgetPasswordFormValues
  };

  // Create schema with translated error messages directly in this file
  const schema = z.object({
    email: z.email({ message: t($ => $.auth.forgetPassword.invalidEmail) }),
  });

  const form = useAppForm({
    defaultValues: forgetPasswordFormData.defaultValue,
    validators: {
      onChange: schema,
    },
    onSubmit({ value }) {
      const values = {
        email: value.email ?? "",
        redirectTo: `${window.location.origin}/reset-password`
      }
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
        className="space-y-5"
      >
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start space-x-2">
            <div className="text-sm text-destructive font-medium">{errorMessage}</div>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
            <form.AppField name="email">
              {(field) => (
                <FormInput
                  field={field}
                  item={forgetPasswordFormData.form.email}
                  className="pl-10"
                  labelClassName="pl-0"
                  showMessage={false}
                />
              )}
            </form.AppField>
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
              {t($ => $.labels.forgetPassword)}...
            </>
          ) : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" />
              {t($ => $.labels.forgetPassword)}
            </>
          )}
        </Button>
      </form>
    </form.AppForm>
  )
}