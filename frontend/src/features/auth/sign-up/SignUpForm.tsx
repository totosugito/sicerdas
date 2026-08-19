import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { FormInput, FormPassword } from "@/components/forms";
import { Loader2, Mail, Lock, User, UserPlus, AlertCircle } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { AppRoute } from "@/constants/app-route";
import { Link } from "@tanstack/react-router";

export type SignUpFormValues = {
  name: string;
  email: string;
  password: string;
};

type Props = {
  onFormSubmit: (values: SignUpFormValues) => void;
  loading?: boolean;
  errorMessage?: string;
};

export const SignUpForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useAppTranslation();

  const signUpFormData = {
    form: {
      name: {
        type: "text",
        name: "name",
        label: t(($) => $.labels.fullName),
        placeholder: t(($) => $.auth.signUp.namePlaceholder),
      },
      email: {
        type: "text",
        name: "email",
        label: t(($) => $.labels.emailAddress),
        placeholder: t(($) => $.auth.signUp.emailPlaceholder),
      },
      password: {
        type: "password",
        name: "password",
        label: t(($) => $.labels.password),
        placeholder: t(($) => $.auth.signUp.passwordPlaceholder),
      },
    },
    defaultValue: {
      name: "",
      email: "",
      password: "",
    } satisfies SignUpFormValues,
  };

  const schema = z.object({
    name: z.string().min(1, { message: t(($) => $.message.nameRequired) }),
    email: z.email({ message: t(($) => $.message.invalidEmail) }),
    password: z.string().min(1, { message: t(($) => $.message.passwordRequired) }),
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
        className="space-y-4"
      >
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3.5 flex items-start gap-2.5 text-sm animate-in fade-in-50 duration-200">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="font-medium text-xs sm:text-sm">{errorMessage}</div>
          </div>
        )}

        <div className="space-y-3.5">
          <form.AppField name="name">
            {(field) => (
              <FormInput
                field={field}
                item={signUpFormData.form.name}
                leftIcon={<User />}
                className="h-10 rounded-xl bg-background/50 focus:bg-background transition-colors"
                showMessage={true}
              />
            )}
          </form.AppField>

          <form.AppField name="email">
            {(field) => (
              <FormInput
                field={field}
                item={signUpFormData.form.email}
                leftIcon={<Mail />}
                className="h-10 rounded-xl bg-background/50 focus:bg-background transition-colors"
                showMessage={true}
              />
            )}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <FormPassword
                field={field}
                item={signUpFormData.form.password}
                leftIcon={<Lock />}
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
              {t(($) => $.labels.signingUp)}...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              {t(($) => $.labels.signUp)}
            </>
          )}
        </Button>

        <div className="text-center pt-3 border-t border-border/40">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t(($) => $.auth.signUp.alreadyHaveAccount)}{" "}
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