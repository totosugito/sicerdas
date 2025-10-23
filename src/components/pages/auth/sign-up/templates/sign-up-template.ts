import { z } from "zod"
import { APP_CONFIG } from "@/constants/config"

// We'll create the schema dynamically in the component where we have access to translations
const createSignUpSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(1, { message: t("message.nameRequired") }),
  email: z.string().email({ message: t("message.invalidEmail") }),
  password: z.string().min(1, { message: t("message.passwordRequired") }),
});

export type SignUpFormValues = {
  name: string
  email: string
  password: string,
}

const signUpFormData = {
    form: {
        name: {
            type: "text",
            name: "name",
            label: "labels.fullName",
            placeholder: "signUp.namePlaceholder",
        },
        email: {
            type: "text",
            name: "email",
            label: "labels.emailAddress",
            placeholder: "signUp.emailPlaceholder",
        },
        password: {
            type: "password",
            name: "password",
            label: "labels.password",
            placeholder: "signUp.passwordPlaceholder",
        }
    },
    defaultValue: {
        name: "",
        email: "",
        password: "",
    } satisfies SignUpFormValues
}

const createSignUpBodyParam = (data: Record<string, any>) => {
    const formData = new FormData();
    formData.append('name', data?.name ?? "");
    formData.append('email', data?.email ?? "");
    formData.append('password', data?.password ?? "");
    return formData;
}

export { signUpFormData, createSignUpBodyParam, createSignUpSchema }