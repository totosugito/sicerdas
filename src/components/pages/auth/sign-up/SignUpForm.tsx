import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { FormInput, FormPassword } from "@/components/forms";
import { Loader2, Mail, Lock, User, UserPlus, AlertCircle } from "lucide-react";
import { useAppTranslation } from '@/lib/i18n-typed';
import { z } from "zod";
import { AppRoute } from "@/constants/app-route";

export type SignUpFormValues = {
  name: string
  email: string
  password: string,
}

type Props = {
  onFormSubmit: (values: SignUpFormValues) => void;
  loading?: boolean,
  errorMessage?: string,
}

export const SignUpForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useAppTranslation();

  // Define signUpFormData directly in this file
  const signUpFormData = {
    form: {
      name: {
        type: "text",
        name: "name",
        label: t($ => $.labels.fullName),
        placeholder: t($ => $.auth.signUp.namePlaceholder),
      },
      email: {
        type: "text",
        name: "email",
        label: t($ => $.labels.emailAddress),
        placeholder: t($ => $.auth.signUp.emailPlaceholder),
      },
      password: {
        type: "password",
        name: "password",
        label: t($ => $.labels.password),
        placeholder: t($ => $.auth.signUp.passwordPlaceholder),
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
    name: z.string().min(1, { message: t($ => $.message.nameRequired) }),
    email: z.email({ message: t($ => $.message.invalidEmail) }),
    password: z.string().min(1, { message: t($ => $.message.passwordRequired) }),
  });

  const form = useAppForm({
    defaultValues: signUpFormData.defaultValue,
    validators: {
      onChange: schema,
    },
    onSubmit({ value }) {
      onFormSubmit(value);
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
            <User className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
            <form.AppField name="name">
              {(field) => (
                <FormInput
                  field={field}
                  item={signUpFormData.form.name}
                  className="pl-10"
                  showMessage={false}
                />
              )}
            </form.AppField>
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
            <form.AppField name="email">
              {(field) => (
                <FormInput
                  field={field}
                  item={signUpFormData.form.email}
                  className="pl-10"
                  showMessage={false}
                />
              )}
            </form.AppField>
          </div>
          <div className="relative">
            <form.AppField name="password">
              {(field) => (
                <FormPassword
                  field={field}
                  item={signUpFormData.form.password}
                  className="pl-10"
                  showMessage={false}
                />
              )}
            </form.AppField>
            <Lock className="absolute left-3 top-8 transform h-4 w-4 text-muted-foreground" />
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
              {t($ => $.labels.signingUp)}...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              {t($ => $.labels.signUp)}
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t($ => $.auth.signUp.alreadyHaveAccount)}{" "}
            <a href={AppRoute.auth.signIn.url} className="text-primary hover:text-primary/80 font-medium transition-colors">
              {t($ => $.auth.signUp.backToSignIn)}
            </a>
          </p>
        </div>
      </form>
    </form.AppForm>
  )
}