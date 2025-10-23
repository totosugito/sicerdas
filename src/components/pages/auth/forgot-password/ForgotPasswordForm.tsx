import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/custom/forms";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { forgotPasswordFormData, createForgotPasswordSchema } from "./templates/forgot-password-template";
import { useTranslation } from 'react-i18next';

type Props = {
  onFormSubmit: SubmitHandler<any>
  loading?: boolean,
  errorMessage?: string,
}

export const ForgotPasswordForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useTranslation();
  
  // Create schema with translated error messages
  const schema = createForgotPasswordSchema(t);
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: forgotPasswordFormData.defaultValue,
  });

  // Create a copy of the form data with translated labels and placeholders
  const translatedFormData = {
    ...forgotPasswordFormData,
    form: {
      email: {
        ...forgotPasswordFormData.form.email,
        label: t(forgotPasswordFormData.form.email.label),
        placeholder: t(forgotPasswordFormData.form.email.placeholder),
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-5">
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start space-x-2">
            <div className="text-sm text-destructive font-medium">{errorMessage}</div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-9.5 h-4 w-4 text-muted-foreground" />
            <FormInput
              form={form}
              item={translatedFormData.form.email}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("labels.forgotPassword")}...
            </>
          ) : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" />
              {t("labels.forgotPassword")}
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}