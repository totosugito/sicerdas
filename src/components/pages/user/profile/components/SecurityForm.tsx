import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useTranslation } from 'react-i18next'
import { ControlForm } from '@/components/custom/forms'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'

// Define the form values type
export type SecurityFormValues = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// Define a function to create form data with translations
const createSecurityFormData = (t: (key: string) => string) => {
  return {
    form: {
      currentPassword: {
        type: "password",
        name: "currentPassword",
        label: t("user.profile.security.currentPassword"),
        placeholder: t("user.profile.security.currentPasswordPlaceholder"),
      },
      newPassword: {
        type: "password",
        name: "newPassword",
        label: t("user.profile.security.newPassword"),
        placeholder: t("user.profile.security.newPasswordPlaceholder"),
      },
      confirmPassword: {
        type: "password",
        name: "confirmPassword",
        label: t("user.profile.security.confirmPassword"),
        placeholder: t("user.profile.security.confirmPasswordPlaceholder"),
      }
    },
    schema: z.object({
      currentPassword: z.string().min(1, t('user.profile.security.passwordMinLengthError')),
      newPassword: z.string().min(6, t('user.profile.security.passwordMinLengthError')),
      confirmPassword: z.string().min(6, t('user.profile.security.passwordMinLengthError')),
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: t('user.profile.security.passwordMismatchError'),
      path: ["confirmPassword"],
    }),
    defaultValue: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    } satisfies SecurityFormValues
  }
}

interface SecurityFormProps {
  form: any
  onSubmit: (values: any) => void
  error?: string | null
}

export function SecurityForm({ form, onSubmit, error }: SecurityFormProps) {
  const { t } = useTranslation()

  // Create form data with translated labels and placeholders
  const formData = createSecurityFormData(t)

  // Define form items
  const formItems = formData.form

  // Handle form submission
  const handleSubmit = (values: Record<string, any>) => {
    onSubmit({
      currentPassword: values?.currentPassword ?? "",
      newPassword: values?.newPassword ?? "",
    })
  }

  return (
    <Card className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-none w-full pb-0">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
        <CardTitle className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
          {t("user.profile.security.title")}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="px-6 pb-6 space-y-6 w-full">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-red-700 dark:text-red-300">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <ControlForm
              form={form}
              item={formItems.currentPassword}
            />

            <ControlForm
              form={form}
              item={formItems.newPassword}
            />

            <ControlForm
              form={form}
              item={formItems.confirmPassword}
            />
          </CardContent>
          {form.formState.isDirty && (
            <CardFooter className="p-6 flex justify-end items-center gap-4 bg-slate-50 dark:bg-slate-900 rounded-b-xl border-t border-slate-200 dark:border-slate-800">
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  {t("labels.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="default"
                >
                  {t("user.profile.security.updatePassword")}
                </Button>
              </>
            </CardFooter>)}
        </form>
      </Form>
    </Card>
  )
}

export { createSecurityFormData }