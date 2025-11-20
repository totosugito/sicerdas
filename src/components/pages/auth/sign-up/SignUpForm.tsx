import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput, FormPassword } from "@/components/custom/forms";
import { Loader2, Mail, Lock, User, UserPlus, AlertCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { z } from "zod";
import { AppRoute } from "@/constants/app-route";

export type SignUpFormValues = {
  name: string
  email: string
  password: string,
}

type Props = {
  onFormSubmit: SubmitHandler<FormData>
  loading?: boolean,
  errorMessage?: string,
}

export const SignUpForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useTranslation();
  
  // Define signUpFormData directly in this file
  const signUpFormData = {
    form: {
      name: {
        type: "text",
        name: "name",
        label: t("labels.fullName"),
        placeholder: t("signUp.namePlaceholder"),
      },
      email: {
        type: "text",
        name: "email",
        label: t("labels.emailAddress"),
        placeholder: t("signUp.emailPlaceholder"),
      },
      password: {
        type: "password",
        name: "password",
        label: t("labels.password"),
        placeholder: t("signUp.passwordPlaceholder"),
      }
    },
    defaultValue: {
      name: "",
      email: "",
      password: "",
    } satisfies SignUpFormValues
  };

  // Create schema with translated error messages directly in this file
  const schema = z.object({
    name: z.string().min(1, { message: t("message.nameRequired") }),
    email: z.email({ message: t("message.invalidEmail") }),
    password: z.string().min(1, { message: t("message.passwordRequired") }),
  });
  
  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: signUpFormData.defaultValue,
  });

  const onFormSubmit_ = (data: SignUpFormValues) => {
    const values = new FormData();
    values.append('name', data?.name ?? "");
    values.append('email', data?.email ?? "");
    values.append('password', data?.password ?? "");
    onFormSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit_)} className="space-y-5">
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
              item={signUpFormData.form.name}
              className="pl-10"
              showMessage={false}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
            <FormInput
              form={form}
              item={signUpFormData.form.email}
              className="pl-10"
              showMessage={false}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
            <FormPassword
              form={form}
              item={signUpFormData.form.password}
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

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t("signUp.alreadyHaveAccount")}{" "}
            <a href={AppRoute.auth.signIn.url} className="text-primary hover:text-primary/80 font-medium transition-colors">
              {t("signUp.backToSignIn")}
            </a>
          </p>
        </div>
      </form>
    </Form>
  )
}