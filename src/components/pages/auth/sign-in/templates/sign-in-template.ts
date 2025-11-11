import { z } from "zod"
import { APP_CONFIG } from "@/constants/config"
import { LoginFormValues } from "@/types/auth"

// We'll create the schema dynamically in the component where we have access to translations
const createSignInSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({ message: t("signIn.invalidEmail") }),
  password: z.string().min(1, { message: t("signIn.passwordRequired") }),
});

const signInFormData = {
    form: {
        email: {
            type: "text",
            name: "email",
            label: "labels.emailAddress",
            placeholder: "signIn.emailPlaceholder",
        },
        password: {
            type: "password",
            name: "password",
            label: "labels.password",
            placeholder: "signIn.passwordPlaceholder",
        }
    },
    defaultValue: {
        email: APP_CONFIG.demoUser.email,
        password: APP_CONFIG.demoUser.password,
    } satisfies LoginFormValues
}

const createSignInBodyParam = (data: Record<string, any>) => {
    const formData = new FormData();
    formData.append('email', data?.email ?? "");
    formData.append('password', data?.password ?? "");
    return formData;
}

export { signInFormData, createSignInBodyParam, createSignInSchema }