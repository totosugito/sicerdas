import { z } from "zod"
import { APP_CONFIG } from "@/constants/config"

export type ForgetPasswordFormValues = {
  email: string;
};

// We'll create the schema dynamically in the component where we have access to translations
const createForgetPasswordSchema = (t: (key: string) => string) => z.object({
  email: z.email({ message: t("forgotPassword.invalidEmail") }),
});

const forgetPasswordFormData = {
    form: {
        email: {
            type: "text",
            name: "email",
            label: "forgetPassword.emailAddress",
            placeholder: "forgetPassword.emailPlaceholder",
        }
    },
    defaultValue: {
        email: APP_CONFIG.demoUser.email,
    } satisfies ForgetPasswordFormValues
}

// Updated to return JSON object instead of FormData to match backend expectations
const createForgetPasswordBodyParam = (data: Record<string, any>) => {
    return {
        email: data?.email ?? "",
        // Add redirect URL
        redirectTo: `${window.location.origin}/reset-password`
    };
}

export { forgetPasswordFormData, createForgetPasswordBodyParam, createForgetPasswordSchema }