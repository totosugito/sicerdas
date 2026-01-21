import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

interface FormWithDetectorProps {
    form: UseFormReturn<any>;
    onSubmit: (data: any) => void;
    children: React.ReactNode;
    className?: string;
    schema?: z.ZodType<any> | any;
}

export const FormWithDetector = ({
    form,
    onSubmit,
    children,
    className,
    schema
}: FormWithDetectorProps) => {
    const { t } = useTranslation();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Add a function to get detailed validation results
    const getDetailedValidationErrors = async () => {
        try {
            // Manually validate with Zod to see detailed errors
            if (schema) {
                // Handle both Zod schema instances and plain objects (for backward compatibility if needed)
                const validationSchema = schema instanceof z.ZodType ? schema : z.object(schema);
                const values = form.getValues();

                try {
                    const result = await validationSchema.safeParseAsync(values);

                    if (!result.success) {
                        return result.error.flatten();
                    } else {
                        return null;
                    }
                } catch (zodError: any) {
                    return { formErrors: [zodError.message || t('labels.formValidationErrorGeneric')] };
                }
            }
            return null;
        } catch (error) {
            return { formErrors: [t('labels.formValidationError')] };
        }
    };

    // Enhanced validation function that provides better error reporting
    const validateForm = async () => {
        try {
            // First, trigger the built-in validation
            const isValid = await form.trigger();

            // Get form values and errors
            const formErrors = form.formState.errors;

            // If validation failed but we don't see errors, do manual validation
            if (!isValid && Object.keys(formErrors).length === 0) {
                const zodErrors = await getDetailedValidationErrors();
                return { isValid: false, errors: zodErrors || { formErrors: [t('labels.formValidationError')] } };
            }

            // Return the validation result
            return { isValid, errors: isValid ? null : formErrors };
        } catch (error) {
            return { isValid: false, errors: { formErrors: [t('labels.formValidationErrorUnknown')] } };
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Clear previous error message
            setErrorMessage(null);

            const { isValid, errors } = await validateForm();

            if (!isValid) {
                // Handle errors based on their type
                if (errors) {
                    let errorMsg = t('labels.formValidationError');

                    // Check if it's a Zod flattened error object
                    if ('fieldErrors' in errors && !('message' in errors)) { // check !message to distinguish from FieldError that might have message prop
                        // Actually RHF errors don't look like flattened Zod errors usually, but let's follow the logic
                        const fieldErrors = (errors as any).fieldErrors;
                        if (fieldErrors && typeof fieldErrors === 'object') {
                            const errorMessages = Object.entries(fieldErrors)
                                .map(([fieldName, ferrs]) => {
                                    return Array.isArray(ferrs) ? ferrs[0] : ferrs;
                                });

                            if (errorMessages.length > 0) {
                                errorMsg = String(errorMessages[0]);
                            }
                        }
                    }
                    // Check if it's form-level errors from Zod flatten
                    else if ('formErrors' in errors && Array.isArray((errors as any).formErrors)) {
                        const formErrors = (errors as any).formErrors;
                        if (formErrors.length > 0) {
                            errorMsg = formErrors[0];
                        }
                    }
                    // Handle react-hook-form errors (FieldErrors)
                    else {
                        const rhfErrors = errors as Record<string, any>;
                        // RHF errors is an object where keys are field names and values are FieldError objects { type, message, ref, ... }
                        // traverse the object to find the first error message

                        const findFirstError = (errs: any): string | null => {
                            const keys = Object.keys(errs);
                            for (const key of keys) {
                                const err = errs[key];
                                if (err && typeof err === 'object') {
                                    if ('message' in err && typeof err.message === 'string' && err.message) {
                                        return err.message;
                                    }
                                    // recursive for nested errors
                                    const nested = findFirstError(err);
                                    if (nested) return nested;
                                } else if (typeof err === 'string') {
                                    return err;
                                }
                            }
                            return null;
                        }

                        const found = findFirstError(rhfErrors);
                        if (found) {
                            errorMsg = found;
                        } else {
                            errorMsg = t('labels.formValidationErrorGeneric');
                        }
                    }

                    // Set error message to display in the dialog
                    setErrorMessage(errorMsg);
                    return;
                } else {
                    // Fallback error message
                    setErrorMessage(t('labels.formValidationError'));
                    return;
                }
            }

            // Form is valid, proceed with submission
            // We pass the data to the onSubmit handler
            onSubmit(form.getValues());
        } catch (error) {
            setErrorMessage(t('labels.formValidationErrorUnknown'));
        }
    };

    return (
        <form onSubmit={handleFormSubmit} className={className}>
            {/* Display error message */}
            {errorMessage && (
                <div className="flex items-center bg-destructive/10 border border-destructive/20 text-sm text-destructive mb-4 p-3 rounded-lg gap-3">
                    <AlertCircle className="h-5 w-5" />
                    <div className=''>
                        {errorMessage}
                    </div>
                </div>
            )}
            {children}
        </form>
    );
};
