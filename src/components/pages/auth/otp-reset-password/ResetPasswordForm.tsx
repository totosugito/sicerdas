import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { FormPassword } from "@/components/custom/forms";
import { Loader2, Lock, Check } from "lucide-react";
import { resetPasswordFormData, createResetPasswordSchema, ResetPasswordFormValues } from "./templates/reset-password-template";
import { useTranslation } from 'react-i18next';
import { AlertCircle } from "lucide-react";

type Props = {
  onFormSubmit: SubmitHandler<ResetPasswordFormValues>
  loading?: boolean,
  errorMessage?: string,
}

export const ResetPasswordForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useTranslation();
  
  // Create schema with translated error messages
  const schema = createResetPasswordSchema(t);
  
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: resetPasswordFormData.defaultValue,
  });

  // Create a copy of the form data with translated labels and placeholders
  const translatedFormData = {
    ...resetPasswordFormData,
    form: {
      password: {
        ...resetPasswordFormData.form.password,
        label: t(resetPasswordFormData.form.password.label),
        placeholder: t(resetPasswordFormData.form.password.placeholder),
      },
      confirmPassword: {
        ...resetPasswordFormData.form.confirmPassword,
        label: t(resetPasswordFormData.form.confirmPassword.label),
        placeholder: t(resetPasswordFormData.form.confirmPassword.placeholder),
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-5">
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-destructive font-medium">{errorMessage}</div>
          </div>
        )}
        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
            <FormPassword
              form={form}
              item={translatedFormData.form.password}
              className="pl-10"
              showMessage={true}
            />
          </div>
          <div className="relative">
            <Check className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
            <FormPassword
              form={form}
              item={translatedFormData.form.confirmPassword}
              className="pl-10"
              showMessage={true}
            />
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
              {t("labels.resettingPassword")}...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              {t("labels.resetPassword")}
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}