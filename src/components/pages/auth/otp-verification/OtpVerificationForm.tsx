import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, ShieldCheck } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { AlertCircle } from "lucide-react";
import * as z from "zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

// Create schema for OTP verification
const createOtpVerificationSchema = (t: (key: string) => string) => z.object({
  email: z.email({ message: t("message.invalidEmail") }).min(1, { message: t("message.emailRequired") }),
  otp: z.string().min(6, { message: t("message.otpRequired") }),
});

export type OtpVerificationFormValues = {
  email: string;
  otp: string;
};

const otpVerificationFormData = {
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
          {/* Email is now handled via props, no need to display input */}
          <input type="hidden" {...form.register("email")} value={email || ""} />
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    {...field}
                    onChange={(value) => field.onChange(value)}
                    disabled={loading}
                  >
                    <InputOTPGroup className="flex flex-row gap-2">
                      <InputOTPSlot
                        index={0}
                        className="h-12 w-10 text-xl rounded-md border-2 border-input data-[state=active]:border-ring"
                      />
                      <InputOTPSlot
                        index={1}
                        className="h-12 w-10 text-xl rounded-md border-2 border-input data-[state=active]:border-ring"
                      />
                      <InputOTPSlot
                        index={2}
                        className="h-12 w-10 text-xl rounded-md border-2 border-input data-[state=active]:border-ring"
                      />
                      <InputOTPSlot
                        index={3}
                        className="h-12 w-10 text-xl rounded-md border-2 border-input data-[state=active]:border-ring"
                      />
                      <InputOTPSlot
                        index={4}
                        className="h-12 w-10 text-xl rounded-md border-2 border-input data-[state=active]:border-ring"
                      />
                      <InputOTPSlot
                        index={5}
                        className="h-12 w-10 text-xl rounded-md border-2 border-input data-[state=active]:border-ring"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 mt-2"
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