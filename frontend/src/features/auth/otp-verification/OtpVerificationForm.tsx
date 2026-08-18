import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAppTranslation } from '@/lib/i18n-typed';
import { AlertCircle } from "lucide-react";
import * as z from "zod";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

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
  onFormSubmit: (values: { otp: string }) => void;
  loading?: boolean;
  errorMessage?: string;
  email?: string;
};

export const OtpVerificationForm = ({ onFormSubmit, loading, errorMessage, email }: Props) => {
  const { t } = useAppTranslation();

  // Create schema with translated error messages
  const schema = z.object({
    email: z.email({ message: t($ => $.message.invalidEmail) }).min(1, { message: t($ => $.message.emailRequired) }),
    otp: z.string().min(6, { message: t($ => $.message.otpRequired) }),
  });

  const form = useAppForm({
    defaultValues: {
      ...otpVerificationFormData.defaultValue,
      email: email || ""
    },
    validators: {
      onChange: schema,
    },
    onSubmit({ value }) {
      onFormSubmit({
        otp: value.otp,
      });
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
          {/* Email is now handled via props, no need to display input */}
          <input type="hidden" name="email" value={email || ""} />
          
          <form.AppField name="otp">
            {(field) => (
              <form.Item className="flex flex-col items-center">
                <field.Control>
                  <InputOTP
                    maxLength={6}
                    name={field.name}
                    value={field.state.value}
                    disabled={loading}
                    onChange={(value) => field.handleChange(value)}
                  >
                    <InputOTPGroup className="flex flex-row gap-2">
                      <InputOTPSlot
                        index={0}
                        className="h-12 w-12 text-xl rounded-md border-2 border-input data-[state=active]:border-ring"
                      />
                      <InputOTPSlot
                        index={1}
                        className="h-12 w-12 text-xl rounded-md border-2 border-input data-[state=active]:border-ring"
                      />
                      <InputOTPSlot
                        index={2}
                        className="h-12 w-12 text-xl rounded-md border-2 border-input data-[state=active]:border-ring"
                      />
                      <InputOTPSlot
                        index={3}
                        className="h-12 w-12 text-xl rounded-md border-2 border-input data-[state=active]:border-ring"
                      />
                      <InputOTPSlot
                        index={4}
                        className="h-12 w-12 text-xl rounded-md border-2 border-input data-[state=active]:border-ring"
                      />
                      <InputOTPSlot
                        index={5}
                        className="h-12 w-12 text-xl rounded-md border-2 border-input data-[state=active]:border-ring"
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </field.Control>
                <field.Message />
              </form.Item>
            )}
          </form.AppField>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t($ => $.labels.verifyingOtp)}...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {t($ => $.labels.verifyOtp)}
            </>
          )}
        </Button>
      </form>
    </form.AppForm>
  )
}