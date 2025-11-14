import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from 'react-i18next'

interface PersonalInfoFormProps {
  form: any
  onSubmit: (values: any) => void
}

export function PersonalInfoForm({ form, onSubmit }: PersonalInfoFormProps) {
  const { t } = useTranslation()
  
  return (
    <Card className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-none w-full pt-4">
      <CardHeader className="px-6 border-b border-slate-200 dark:border-slate-800 [.border-b]:pb-4">
        <CardTitle className="text-slate-900 dark:text-slate-100 text-lg font-semibold leading-tight">
          {t("user.profile.personalInfo.title")}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal">
                      {t("user.profile.personalInfo.firstName")}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t("user.profile.personalInfo.firstNamePlaceholder")} 
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
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal">
                      {t("user.profile.personalInfo.lastName")}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t("user.profile.personalInfo.lastNamePlaceholder")} 
                        {...field} 
                        className="flex w-full items-stretch rounded-lg border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal">
                    {t("user.profile.personalInfo.phoneNumber")}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder={t("user.profile.personalInfo.phoneNumberPlaceholder")} 
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-800 dark:text-slate-200 text-sm font-medium leading-normal">
                    {t("user.profile.personalInfo.address")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("user.profile.personalInfo.addressPlaceholder")}
                      className="resize-none rounded-lg border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary"
                      {...field}
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
              {t("labels.save")}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}