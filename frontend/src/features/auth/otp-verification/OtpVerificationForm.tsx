import { useAppForm } from "@/components/ui/form-tanstack";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
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
  } satisfies OtpVerificationFormValues,
};

type Props = {
  onFormSubmit: (values: { otp: string }) => void;
  loading?: boolean;
  errorMessage?: string;
  email?: string;
};

export const OtpVerificationForm = ({ onFormSubmit, loading, errorMessage, email }: Props) => {
  const { t } = useAppTranslation();

  const schema = z.object({
    email: z
      .email({ message: t(($) => $.message.invalidEmail) })
      .min(1, { message: t(($) => $.message.emailRequired) }),
    otp: z.string().min(6, { message: t(($) => $.message.otpRequired) }),
  });

  const form = useAppForm({
    defaultValues: {
      ...otpVerificationFormData.defaultValue,
      email: email || "",
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
        className="space-y-4"
      >
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-3.5 flex items-start gap-2.5 text-sm animate-in fade-in-50 duration-200">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="font-medium text-xs sm:text-sm">{errorMessage}</div>
          </div>
        )}

        <div className="space-y-3.5">
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
                    <InputOTPGroup className="flex flex-row gap-1.5 sm:gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                          className="h-12 w-11 sm:w-12 text-xl font-bold rounded-xl border border-input bg-background/60 dark:bg-card/60 shadow-xs data-[state=active]:border-primary data-[state=active]:ring-2 data-[state=active]:ring-primary/20 transition-all"
                        />
                      ))}
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
          className="w-full h-10 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.99] mt-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t(($) => $.labels.verifyingOtp)}...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {t(($) => $.labels.verifyOtp)}
            </>
          )}
        </Button>
      </form>
    </form.AppForm>
  );
};