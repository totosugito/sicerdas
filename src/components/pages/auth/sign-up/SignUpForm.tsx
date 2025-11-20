import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput, FormPassword } from "@/components/custom/forms";
import { Loader2, Mail, Lock, User, UserPlus } from "lucide-react";
import { signUpFormData, createSignUpSchema, SignUpFormValues } from "./templates/sign-up-template";
import { useTranslation } from 'react-i18next';
import { AlertCircle } from "lucide-react";

type Props = {
  onFormSubmit: SubmitHandler<SignUpFormValues>
  loading?: boolean,
  errorMessage?: string,
}

export const SignUpForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useTranslation();
  
  // Create schema with translated error messages
  const schema = createSignUpSchema(t);
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: signUpFormData.defaultValue,
  });

  // Create a copy of the form data with translated labels and placeholders
  const translatedFormData = {
    ...signUpFormData,
    form: {
      name: {
        ...signUpFormData.form.name,
        label: t(signUpFormData.form.name.label),
        placeholder: t(signUpFormData.form.name.placeholder),
      },
      email: {
        ...signUpFormData.form.email,
        label: t(signUpFormData.form.email.label),
        placeholder: t(signUpFormData.form.email.placeholder),
      },
      password: {
        ...signUpFormData.form.password,
        label: t(signUpFormData.form.password.label),
        placeholder: t(signUpFormData.form.password.placeholder),
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
            <User className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
            <FormInput
              form={form}
              item={translatedFormData.form.name}
              className="pl-10"
              showMessage={false}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
            <FormInput
              form={form}
              item={translatedFormData.form.email}
              className="pl-10"
              showMessage={false}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
            <FormPassword
              form={form}
              item={translatedFormData.form.password}
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
              {t("labels.signingUp")}...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              {t("labels.signUp")}
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}