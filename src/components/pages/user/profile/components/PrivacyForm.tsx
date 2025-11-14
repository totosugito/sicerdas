import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { useTranslation } from 'react-i18next'

interface PrivacyFormProps {
  form: any
  onSubmit: (values: any) => void
}

export function PrivacyForm({ form, onSubmit }: PrivacyFormProps) {
  const { t } = useTranslation()
  
  return (
    <Card className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-none w-full pt-4">
      <CardHeader className="px-6 border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
        <CardTitle className="text-slate-900 dark:text-slate-100 text-lg font-semibold leading-tight">
          {t("user.profile.privacy.title")}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="px-6 pb-6 space-y-6">
            <FormField
              control={form.control}
              name="profileVisibility"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("user.profile.privacy.profileVisibility")}</FormLabel>
                    <FormDescription>
                      {t("user.profile.privacy.profileVisibilityDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emailNotifications"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("user.profile.privacy.emailNotifications")}</FormLabel>
                    <FormDescription>
                      {t("user.profile.privacy.emailNotificationsDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="twoFactorAuth"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">{t("user.profile.privacy.twoFactorAuth")}</FormLabel>
                    <FormDescription>
                      {t("user.profile.privacy.twoFactorAuthDescription")}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="px-6 flex justify-end items-center gap-4 bg-slate-50 dark:bg-slate-900 rounded-b-xl border-t border-slate-200 dark:border-slate-800">
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
              {t("user.profile.privacy.savePreferences")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}