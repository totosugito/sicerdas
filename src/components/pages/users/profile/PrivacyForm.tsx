import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ControlForm, FormWithDetector } from "@/components/forms";
import { useAppTranslation, AppTranslation } from "@/lib/i18n-typed";
import { z } from "zod";
import { useRef, useEffect } from "react";

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
  defaultValues: Record<string, any>;
}

export function PrivacyForm({ form, onSubmit, error, defaultValues }: PrivacyFormProps) {
  const { t } = useAppTranslation();
  const originalValues = useRef<Record<string, any>>({});

  // Sync originalValues ref with defaultValues prop
  useEffect(() => {
    if (defaultValues) {
      originalValues.current = defaultValues;
    }
  }, [defaultValues]);

  // Create form data with translated labels and placeholders
  const formData = createPrivacyFormData(t);

  // Define form items
  const formItems = formData.form;

  // Handle form submission - only submit if at least one change exists
  const handleSubmit = (values: Record<string, any>) => {
    const orig = originalValues.current;
    let hasChanged = false;

    Object.keys(formItems).forEach((key) => {
      const val = !!values[key];
      const origVal = !!orig[key];
      if (val !== origVal) {
        hasChanged = true;
      }
    });

    if (hasChanged) {
      onSubmit(values);
    } else {
      onSubmit({}); // Send empty object to trigger early success exit in parent
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle>
          {t(($) => $.user.profile.privacy.title)}
        </CardTitle>
      </CardHeader>
      <form.AppForm>
        <FormWithDetector
          form={form}
          onSubmit={handleSubmit}
          className="w-full"
          errorClassName="mx-6"
          error={error}
        >
          <CardContent className="flex flex-col gap-6">
            <form.AppField name="emailNotifications">
              {(field: any) => (
                <ControlForm
                  field={field}
                  item={formItems.emailNotifications}
                  showMessage={false}
                  wrapperClassName="rounded-lg border p-4"
                />
              )}
            </form.AppField>
          </CardContent>
          <CardFooter className="justify-end gap-4 border-t">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              {t(($) => $.labels.cancel)}
            </Button>
            <Button type="submit" variant="default">
              {t(($) => $.user.profile.privacy.savePreferences)}
            </Button>
          </CardFooter>
        </FormWithDetector>
      </form.AppForm>
    </Card>
  );
}

export { createPrivacyFormData };
