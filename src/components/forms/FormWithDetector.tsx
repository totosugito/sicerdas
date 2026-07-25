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
        const errorMsg = typeof firstError === "object" && firstError !== null && "message" in firstError
          ? String(firstError.message)
          : String(firstError);
          
        setErrorMessage(errorMsg || t(($) => $.labels.formValidationError));
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
            "flex items-center bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-6 p-3 rounded-lg gap-3",
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
