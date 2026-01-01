import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/custom/forms";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { z } from "zod";
import { APP_CONFIG } from "@/constants/config";

type Props = {
  onFormSubmit: SubmitHandler<Record<string, any>>;
  loading?: boolean,
  errorMessage?: string,
}

// Define ForgetPasswordFormValues type directly in this file
export type ForgetPasswordFormValues = {
  email: string;
};

export const ForgetPasswordForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useTranslation();

  // Define forgetPasswordFormData directly in this file
  const forgetPasswordFormData = {
    form: {
      email: {
        type: "text",
        name: "email",
        label: t("auth.forgetPassword.emailAddress"),
        placeholder: t("auth.forgetPassword.emailPlaceholder"),
      }
    },
    defaultValue: {
      email: APP_CONFIG.demoUser.email,
    } satisfies ForgetPasswordFormValues
  };

  // Create schema with translated error messages directly in this file
  const schema = z.object({
    email: z.email({ message: t("auth.forgetPassword.invalidEmail") }),
  });
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: forgetPasswordFormData.defaultValue,
  });

  const onFormSubmit_ = (data: ForgetPasswordFormValues) => {
    const values = {
      email: data?.email ?? "",
      redirectTo: `${window.location.origin}/reset-password`
    }
    onFormSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit_)} className="space-y-5">
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start space-x-2">
            <div className="text-sm text-destructive font-medium">{errorMessage}</div>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
            <FormInput
              form={form}
              item={forgetPasswordFormData.form.email}
              className="pl-10"
              showMessage={false}
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
              {t("labels.forgetPassword")}...
            </>
          ) : (
            <>
              <ArrowRight className="mr-2 h-4 w-4" />
              {t("labels.forgetPassword")}
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}