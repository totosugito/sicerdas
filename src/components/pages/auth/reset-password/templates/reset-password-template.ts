import { z } from "zod"

// We'll create the schema dynamically in the component where we have access to translations
const createResetPasswordSchema = (t: (key: string) => string) => z.object({
  password: z.string().min(1, { message: t("message.passwordRequired") }),
  confirmPassword: z.string().min(1, { message: t("message.confirmPasswordRequired") })
}).refine((data) => data.password === data.confirmPassword, {
  message: t("message.passwordsDoNotMatch"),
  path: ["confirmPassword"],
});

export type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export type ResetPasswordData = ResetPasswordFormValues & {
  token: string; // This will be passed from the URL
};

const resetPasswordFormData = {
    form: {
        password: {
            type: "password",
            name: "password",
            label: "labels.newPassword",
            placeholder: "resetPassword.newPasswordPlaceholder",
        },
        confirmPassword: {
            type: "password",
            name: "confirmPassword",
            label: "labels.confirmPassword",
            placeholder: "resetPassword.confirmPasswordPlaceholder",
        }
    },
    defaultValue: {
        password: "",
        confirmPassword: "",
    } satisfies ResetPasswordFormValues
}

const createResetPasswordBodyParam = (data: Record<string, any>) => {
    return {
        token: data?.token ?? "",
        newPassword: data?.password ?? ""
    };
}

export { resetPasswordFormData, createResetPasswordBodyParam, createResetPasswordSchema }