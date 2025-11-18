import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useTranslation } from 'react-i18next'
import { ControlForm } from '@/components/custom/forms'
import { z } from 'zod'
import { AlertCircle } from 'lucide-react'
import { date_to_string } from '@/lib/my-utils'
import { EnumEducationLevel } from 'backend/src/db/schema/enum-app'

// Define the form values type
export type PersonalInfoFormValues = {
  phone: string
  address: string
  school: string
  grade: string
  dateOfBirth: Date | null,
  educationLevel: string
}

// Define a function to create form data with translations
const createPersonalInfoFormData = (t: (key: string) => string) => {
  return {
    form: {
      phone: {
        type: "tel",
        name: "phone",
        label: t("user.profile.personalInfo.phoneNumber"),
        placeholder: t("user.profile.personalInfo.phoneNumberPlaceholder"),
      },
      address: {
        type: "textarea",
        name: "address",
        label: t("user.profile.personalInfo.address"),
        placeholder: t("user.profile.personalInfo.addressPlaceholder"),
      },
      school: {
        type: "textarea",
        name: "school",
        label: t("user.profile.personalInfo.school"),
        placeholder: t("user.profile.personalInfo.schoolPlaceholder"),
      },
      grade: {
        type: "select",
        name: "grade",
        label: t("user.profile.personalInfo.grade"),
        placeholder: t("user.profile.personalInfo.gradePlaceholder"),
        options: [
          { value: "0", label: t("user.profile.personalInfo.gradeOptions.grade0") },
          { value: "1", label: t("user.profile.personalInfo.gradeOptions.grade1") },
          { value: "2", label: t("user.profile.personalInfo.gradeOptions.grade2") },
          { value: "3", label: t("user.profile.personalInfo.gradeOptions.grade3") },
          { value: "4", label: t("user.profile.personalInfo.gradeOptions.grade4") },
          { value: "5", label: t("user.profile.personalInfo.gradeOptions.grade5") },
          { value: "6", label: t("user.profile.personalInfo.gradeOptions.grade6") },
          { value: "7", label: t("user.profile.personalInfo.gradeOptions.grade7") },
          { value: "8", label: t("user.profile.personalInfo.gradeOptions.grade8") },
          { value: "9", label: t("user.profile.personalInfo.gradeOptions.grade9") },
          { value: "10", label: t("user.profile.personalInfo.gradeOptions.grade10") },
          { value: "11", label: t("user.profile.personalInfo.gradeOptions.grade11") },
          { value: "12", label: t("user.profile.personalInfo.gradeOptions.grade12") },
          { value: "other", label: t("user.profile.personalInfo.gradeOptions.other") }
        ],
      },
      dateOfBirth: {
        type: "date",
        name: "dateOfBirth",
        label: t("user.profile.personalInfo.dateOfBirth"),
        placeholder: t("user.profile.personalInfo.dateOfBirthPlaceholder"),
      },
      educationLevel: {
        type: "select",
        name: "educationLevel",
        label: t("user.profile.personalInfo.educationLevel"),
        placeholder: t("user.profile.personalInfo.educationLevelPlaceholder"),
        options: [
          { value: EnumEducationLevel.PAUD, label: t("user.profile.personalInfo.educationLevelOptions.paud") },
          { value: EnumEducationLevel.TK, label: t("user.profile.personalInfo.educationLevelOptions.tk") },
          { value: EnumEducationLevel.SD, label: t("user.profile.personalInfo.educationLevelOptions.sd") },
          { value: EnumEducationLevel.MI, label: t("user.profile.personalInfo.educationLevelOptions.mi") },
          { value: EnumEducationLevel.SMP, label: t("user.profile.personalInfo.educationLevelOptions.smp") },
          { value: EnumEducationLevel.MTS, label: t("user.profile.personalInfo.educationLevelOptions.mts") },
          { value: EnumEducationLevel.SMA, label: t("user.profile.personalInfo.educationLevelOptions.sma") },
          { value: EnumEducationLevel.SMK, label: t("user.profile.personalInfo.educationLevelOptions.smk") },
          { value: EnumEducationLevel.STM, label: t("user.profile.personalInfo.educationLevelOptions.stm") },
          { value: EnumEducationLevel.UNIVERSITY, label: t("user.profile.personalInfo.educationLevelOptions.university") },
          { value: EnumEducationLevel.OTHER, label: t("user.profile.personalInfo.educationLevelOptions.other") },
        ],
      },
    },
    schema: z.object({
      phone: z.string().optional(),
      address: z.string().optional(),
      school: z.string().optional(),
      grade: z.string().optional(),
      dateOfBirth: z.date().nullable().optional(),
      educationLevel: z.string().optional(),
    }),
    defaultValue: {
      phone: "",
      address: "",
      school: "",
      grade: "",
      dateOfBirth: null,
      educationLevel: EnumEducationLevel.UNKNOWN,
    } satisfies PersonalInfoFormValues
  }
}

interface PersonalInfoFormProps {
  form: any
  onSubmit: (values: any) => void
  error?: string | null
}

export function PersonalInfoForm({ form, onSubmit, error }: PersonalInfoFormProps) {
  const { t } = useTranslation()

  // Create form data with translated labels and placeholders
  const formData = createPersonalInfoFormData(t)

  // Define form items
  const formItems = formData.form

  // Handle form submission
  const handleSubmit = (values: Record<string, any>) => {
    onSubmit({
      phone: values?.phone ?? "",
      address: values?.address ?? "",
      school: values?.school ?? "",
      grade: values?.grade ?? "",
      dateOfBirth: values?.dateOfBirth ? date_to_string(values?.dateOfBirth) : null,
      educationLevel: values?.educationLevel ?? EnumEducationLevel.UNKNOWN,
    })
  }

  return (
    <Card className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-none w-full pb-0">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
        <CardTitle className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
          {t("user.profile.personalInfo.title")}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ControlForm
                form={form}
                item={formItems.dateOfBirth}
              />

              <ControlForm
                form={form}
                item={formItems.phone}
              />
            </div>

            <ControlForm
              form={form}
              item={formItems.address}
            />
            <ControlForm
              form={form}
              item={formItems.school}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ControlForm
                form={form}
                item={formItems.educationLevel}
              />
              <ControlForm
                form={form}
                item={formItems.grade}
              />
            </div>

          </CardContent>
          {form.formState.isDirty && (<CardFooter className="p-6 flex justify-end items-center gap-4 bg-slate-50 dark:bg-slate-900 rounded-b-xl border-t border-slate-200 dark:border-slate-800">
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
              {t("labels.save")}
            </Button>
          </CardFooter>)}
        </form>
      </Form>
    </Card>
  )
}

export { createPersonalInfoFormData }