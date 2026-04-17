import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ControlForm } from "@/components/custom/forms";
import { FormWithDetector } from "@/components/custom/components";
import { useAppTranslation, AppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { AlertCircle } from "lucide-react";

// Define the form values type
export type PrivacyFormValues = {
  profileVisibility: boolean;
  emailNotifications: boolean;
  twoFactorAuth: boolean;
};

// Define a function to create form data with translations
const createPrivacyFormData = (t: AppTranslation) => {
  return {
    form: {
      profileVisibility: {
        type: "switch",
        name: "profileVisibility",
        label: t(($) => $.user.profile.privacy.profileVisibility),
        description: t(($) => $.user.profile.privacy.profileVisibilityDescription),
      },
      emailNotifications: {
        type: "switch",
        name: "emailNotifications",
        label: t(($) => $.user.profile.privacy.emailNotifications),
        description: t(($) => $.user.profile.privacy.emailNotificationsDescription),
      },
      twoFactorAuth: {
        type: "switch",
        name: "twoFactorAuth",
        label: t(($) => $.user.profile.privacy.twoFactorAuth),
        description: t(($) => $.user.profile.privacy.twoFactorAuthDescription),
      },
    },
    schema: z.object({
      profileVisibility: z.boolean(),
      emailNotifications: z.boolean(),
      twoFactorAuth: z.boolean(),
    }),
    defaultValue: {
      profileVisibility: false,
      emailNotifications: true,
      twoFactorAuth: false,
    } satisfies PrivacyFormValues,
  };
};

interface PrivacyFormProps {
  form: any;
  onSubmit: (values: any) => void;
  error?: string | null;
}

export function PrivacyForm({ form, onSubmit, error }: PrivacyFormProps) {
  const { t } = useAppTranslation();

  // Create form data with translated labels and placeholders
  const formData = createPrivacyFormData(t);

  // Define form items
  const formItems = formData.form;

  // Handle form submission
  const handleSubmit = (values: Record<string, any>) => {
    onSubmit({
      privacy: {
        profileVisibility: values.profileVisibility,
        emailNotifications: values.emailNotifications,
        twoFactorAuth: values.twoFactorAuth,
      },
    });
  };

  return (
    <Card className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-none w-full pb-0">
      <CardHeader className="border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
        <CardTitle className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight">
          {t(($) => $.user.profile.privacy.title)}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <FormWithDetector
          form={form}
          onSubmit={handleSubmit}
          schema={formData.schema}
          className="w-full"
          errorClassName="mx-6"
          error={error}
        >
          <CardContent className="pb-6 space-y-6 w-full">
            <ControlForm
              form={form}
              item={formItems.emailNotifications}
              showMessage={false}
              wrapperClassName="rounded-lg border p-4"
            />
          </CardContent>
          <CardFooter className="p-6 flex justify-end items-center gap-4 bg-slate-50 dark:bg-slate-900 rounded-b-xl border-t border-slate-200 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {t(($) => $.labels.cancel)}
            </Button>
            <Button type="submit" variant="default">
              {t(($) => $.user.profile.privacy.savePreferences)}
            </Button>
          </CardFooter>
        </FormWithDetector>
      </Form>
    </Card>
  );
}

export { createPrivacyFormData };
