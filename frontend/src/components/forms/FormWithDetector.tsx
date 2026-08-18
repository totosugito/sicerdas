import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

interface FormWithDetectorProps {
  form: any; // TanStack Form instance
  onSubmit: (data: any) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
  errorClassName?: string;
  error?: string | null;
}

export const FormWithDetector = ({
  form,
  onSubmit,
  children,
  className,
  errorClassName,
  error,
}: FormWithDetectorProps) => {
  const { t } = useAppTranslation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setErrorMessage(null);

      // Submit the form which triggers validation
      await form.handleSubmit();

      // Gather form-level errors
      const formErrors = form.state.errors || [];

      // Gather field-level errors
      const fieldErrors = Object.values(form.state.fieldMeta || {})
        .flatMap((meta: any) => meta.errors || [])
        .filter(Boolean);

      const allErrors = [...formErrors, ...fieldErrors];

      if (allErrors.length > 0) {
        // Display the first error message
        const firstError = allErrors[0];
        let errorMsg = "";
        if (typeof firstError === "string") {
          errorMsg = firstError;
        } else if (firstError && typeof firstError === "object") {
          const errObj = firstError as Record<string, any>;
          if (typeof errObj.message === "string") {
            errorMsg = errObj.message;
          } else {
            // Traverse values to check for nested arrays/objects containing "message" keys
            const values = Object.values(errObj);
            let foundMessage = "";
            for (const val of values) {
              if (Array.isArray(val) && val.length > 0) {
                const firstVal = val[0];
                if (firstVal && typeof firstVal === "object" && typeof firstVal.message === "string") {
                  foundMessage = firstVal.message;
                  break;
                }
              } else if (val && typeof val === "object" && typeof val.message === "string") {
                foundMessage = val.message;
                break;
              }
            }
            if (foundMessage) {
              errorMsg = foundMessage;
            } else {
              errorMsg = errObj.message || JSON.stringify(firstError);
            }
          }
        } else {
          errorMsg = String(firstError);
        }

        setErrorMessage(errorMsg || t(($) => $.labels.formValidationError));
      } else {
        // No validation errors - trigger submit callback
        await onSubmit(form.state.values);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t(($) => $.labels.formValidationErrorUnknown));
    }
  };

  const effectiveError = errorMessage || error;

  return (
    <form onSubmit={handleFormSubmit} className={className}>
      {effectiveError && (
        <div
          className={cn(
            "flex items-center bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-0 mt-6 p-3 rounded-lg gap-3",
            errorClassName,
          )}
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>{effectiveError}</div>
        </div>
      )}
      {children}
    </form>
  );
};
