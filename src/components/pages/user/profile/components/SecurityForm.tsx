import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'

interface SecurityFormProps {
  form: any
  onSubmit: (values: any) => void
}

export function SecurityForm({ form, onSubmit }: SecurityFormProps) {
  const { t } = useTranslation()
  
  return (
    <Card className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-none w-full pt-4">
      <CardHeader className="px-6 border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
        <CardTitle className="text-slate-900 dark:text-slate-100 text-lg font-semibold leading-tight">
          {t("user.profile.security.title")}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="px-6 pb-6 space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal">
                    {t("user.profile.security.currentPassword")}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={t("user.profile.security.currentPasswordPlaceholder")} 
                      {...field} 
                      className="flex w-full items-stretch rounded-lg border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal">
                    {t("user.profile.security.newPassword")}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={t("user.profile.security.newPasswordPlaceholder")} 
                      {...field} 
                      className="flex w-full items-stretch rounded-lg border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
                    />
                  </FormControl>
                  <FormDescription className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                    {t("user.profile.security.passwordRequirement")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal">
                    {t("user.profile.security.confirmPassword")}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={t("user.profile.security.confirmPasswordPlaceholder")} 
                      {...field} 
                      className="flex w-full items-stretch rounded-lg border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
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
              {t("user.profile.security.updatePassword")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}