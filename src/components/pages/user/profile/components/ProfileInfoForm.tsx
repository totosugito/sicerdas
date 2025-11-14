import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useTranslation } from 'react-i18next'
import { ControlForm } from '@/components/custom/forms'
import { z } from 'zod'

// Define the form values type
export type ProfileInfoFormValues = {
    fullName: string
    email: string
    bio: string
}

// Define a function to create form data with translations
const createProfileInfoFormData = (t: (key: string) => string) => {
    return {
        form: {
            fullName: {
                type: "text",
                name: "fullName",
                label: t("user.profile.information.fullName"),
                placeholder: t("user.profile.information.fullNamePlaceholder"),
            },
            email: {
                type: "email",
                name: "email",
                label: t("user.profile.information.emailAddress"),
                placeholder: t("user.profile.information.emailPlaceholder"),
            },
            bio: {
                type: "textarea",
                name: "bio",
                label: t("user.profile.information.bio"),
                placeholder: t("user.profile.information.bioPlaceholder"),
            }
        },
        schema: z.object({
            fullName: z.string().min(2, { message: t("user.profile.information.fullNameError") }),
            email: z.string().email({ message: t("user.profile.information.emailError") }),
            bio: z.string().optional(),
        }),
        defaultValue: {
            fullName: "",
            email: "",
            bio: "",
        } satisfies ProfileInfoFormValues
    }
}

interface ProfileInfoFormProps {
    form: any
    onSubmit: (values: any) => void
}

export function ProfileInfoForm({ form, onSubmit }: ProfileInfoFormProps) {
    const { t } = useTranslation()

    // Create form data with translated labels and placeholders
    const formData = createProfileInfoFormData(t)

    // Define form items
    const formItems = formData.form

    // Handle form submission
    const handleSubmit = (values: Record<string, any>) => {
        const formData = new FormData();
        formData.append('fullName', values?.fullName ?? "");
        formData.append('email', values?.email ?? "");
        formData.append('bio', values?.bio ?? "");
        onSubmit(formData);
    }

    return (
        <Card className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-none w-full pb-0">
            <CardHeader className="border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
                <CardTitle className="text-slate-900 dark:text-slate-100 text-lg font-semibold leading-tight">
                    {t("user.profile.information.title")}
                </CardTitle>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <CardContent className="px-6 pb-6 space-y-6 w-full">
                        <div className="flex flex-col items-center gap-6 md:flex-row">
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative group">
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24"
                                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDvtjnRtvHd30rpGf5eqG0cgnjAIIEMkXqM3-DwN4yY5NXj3-Er57Ofx5QBVc2o3zeUuO4NpRPYbI7_yD_ckXi-xXo_s-3WP2uQKVziXSpDqsK6of2_CZ0UtFQkEf_oQUGYg9SRLy57qnQK60AV2zZPEJImCJdO0KdZKvfjzWmZ-9ZnReEHp599aZq1Es_GC2nSXxZD7ax_StXeaG8NTjIxf_FxpTdTbVJ0IsucVbYW7-RNP1RLPlOSkmaEi-kClChhe6KOEB8zYX8")' }}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                                    >
                                        <span className="material-symbols-outlined">photo_camera</span>
                                    </button>
                                </div>
                                <Button type="button" variant="outline" size="sm">
                                    {t("user.profile.information.changeAvatar")}
                                </Button>
                            </div>

                            <div className="grid w-full gap-4">
                                <ControlForm
                                    form={form}
                                    item={formItems.fullName}
                                />

                                <ControlForm
                                    form={form}
                                    item={formItems.email}
                                />
                            </div>
                        </div>

                        <ControlForm
                            form={form}
                            item={formItems.bio}
                        />
                    </CardContent>
                    <CardFooter className="p-6 flex justify-end items-center gap-4 bg-slate-50 dark:bg-slate-900 rounded-b-xl border-t border-slate-200 dark:border-slate-800">
                        <Button
                            type="button"
                            variant="outline"
                        >
                            {t("labels.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            variant="default"
                        >
                            {t("labels.save")}
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>
    )
}

export { createProfileInfoFormData }