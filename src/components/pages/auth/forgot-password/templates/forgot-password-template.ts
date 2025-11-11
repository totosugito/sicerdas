import { z } from "zod"
import { APP_CONFIG } from "@/constants/config"

export type ForgotPasswordFormValues = {
  email: string;
};

// We'll create the schema dynamically in the component where we have access to translations
const createForgotPasswordSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({ message: t("message.invalidEmail") }),
});

const forgotPasswordFormData = {
    form: {
        email: {
            type: "text",
            name: "email",
            label: "labels.emailAddress",
            placeholder: "signIn.emailPlaceholder",
        }
    },
    defaultValue: {
        email: APP_CONFIG.demoUser.email,
    } satisfies ForgotPasswordFormValues
}

// Updated to return JSON object instead of FormData to match backend expectations
const createForgotPasswordBodyParam = (data: Record<string, any>) => {
    return {
        email: data?.email ?? "",
        // Add redirect URL
        redirectTo: `${window.location.origin}/reset-password`
    };
}

export { forgotPasswordFormData, createForgotPasswordBodyParam, createForgotPasswordSchema }