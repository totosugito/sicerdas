import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { FormInput } from "@/components/custom/forms";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { AlertCircle } from "lucide-react";
import * as z from "zod";

// Create schema for OTP verification
const createOtpVerificationSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({ message: t("message.invalidEmail") }).min(1, { message: t("message.emailRequired") }),
  otp: z.string().min(1, { message: t("message.otpRequired") }),
});

export type OtpVerificationFormValues = {
  email: string;
  otp: string;
};

const otpVerificationFormData = {
    form: {
        email: {
            type: "email",
            name: "email",
            label: "labels.email",
            placeholder: "forgotPassword.emailPlaceholder",
        },
        otp: {
            type: "text",
            name: "otp",
            label: "labels.otpCode",
            placeholder: "forgotPassword.otpPlaceholder",
        }
    },
    defaultValue: {
        email: "",
        otp: "",
    } satisfies OtpVerificationFormValues
}

type Props = {
  onFormSubmit: SubmitHandler<OtpVerificationFormValues>
  loading?: boolean,
  errorMessage?: string,
  email?: string,
}

export const OtpVerificationForm = ({ onFormSubmit, loading, errorMessage, email }: Props) => {
  const { t } = useTranslation();
  
  // Create schema with translated error messages
  const schema = createOtpVerificationSchema(t);
  
  const form = useForm<OtpVerificationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...otpVerificationFormData.defaultValue,
      email: email || ""
    },
  });

  // Create a copy of the form data with translated labels and placeholders
  const translatedFormData = {
    ...otpVerificationFormData,
    form: {
      email: {
        ...otpVerificationFormData.form.email,
        label: t(otpVerificationFormData.form.email.label),
        placeholder: t(otpVerificationFormData.form.email.placeholder),
      },
      otp: {
        ...otpVerificationFormData.form.otp,
        label: t(otpVerificationFormData.form.otp.label),
        placeholder: t(otpVerificationFormData.form.otp.placeholder),
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
            <Mail className="absolute left-3 top-9.5 h-4 w-4 text-muted-foreground" />
            <FormInput
              form={form}
              item={translatedFormData.form.email}
              className="pl-10 h-12"
              showMessage={false}
              disabled={!!email}
            />
          </div>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-9.5 h-4 w-4 text-muted-foreground" />
            <FormInput
              form={form}
              item={translatedFormData.form.otp}
              className="pl-10 h-12"
              showMessage={false}
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
              {t("labels.verifyingOtp")}...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {t("labels.verifyOtp")}
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}