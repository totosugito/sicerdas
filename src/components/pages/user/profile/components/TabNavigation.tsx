import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { useTranslation } from 'react-i18next'

export function TabNavigation() {
  const { t } = useTranslation()
  
  return (
    <>
      <div className="md:hidden">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-2 p-1 w-full max-w-md mb-3">
            <TabsList className="flex space-x-2 bg-transparent">
              <TabsTrigger 
                value="profile" 
                className="px-3 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-primary data-[state=inactive]:text-slate-700 data-[state=inactive]:dark:text-slate-300"
              >
                {t("user.profile.tabs.editProfile")}
              </TabsTrigger>
              <TabsTrigger 
                value="personal" 
                className="px-3 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-primary data-[state=inactive]:text-slate-700 data-[state=inactive]:dark:text-slate-300"
              >
                {t("user.profile.tabs.personalInfo")}
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="px-3 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-primary data-[state=inactive]:text-slate-700 data-[state=inactive]:dark:text-slate-300"
              >
                {t("user.profile.tabs.password")}
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="px-3 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-primary data-[state=inactive]:text-slate-700 data-[state=inactive]:dark:text-slate-300"
              >
                {t("user.profile.tabs.notifications")}
              </TabsTrigger>
              <TabsTrigger 
                value="billing" 
                className="px-3 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-primary data-[state=inactive]:text-slate-700 data-[state=inactive]:dark:text-slate-300"
              >
                {t("user.profile.tabs.billing")}
              </TabsTrigger>
              <TabsTrigger 
                value="integrations" 
                className="px-3 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-primary data-[state=inactive]:text-slate-700 data-[state=inactive]:dark:text-slate-300"
              >
                {t("user.profile.tabs.integrations")}
              </TabsTrigger>
            </TabsList>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <TabsList className="hidden md:flex flex-col gap-1 bg-transparent h-fit w-full">
        <TabsTrigger 
          value="profile" 
          className="px-3 py-2 rounded-lg text-sm font-medium data-[state=active]:font-bold data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-primary data-[state=inactive]:text-slate-700 data-[state=inactive]:dark:text-slate-300 justify-start w-full"
        >
          {t("user.profile.tabs.editProfile")}
        </TabsTrigger>
        <TabsTrigger 
          value="personal" 
          className="px-3 py-2 rounded-lg text-sm font-medium data-[state=active]:font-bold data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-primary data-[state=inactive]:text-slate-700 data-[state=inactive]:dark:text-slate-300 justify-start w-full"
        >
          {t("user.profile.tabs.personalInfo")}
        </TabsTrigger>
        <TabsTrigger 
          value="security" 
          className="px-3 py-2 rounded-lg text-sm font-medium data-[state=active]:font-bold data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-primary data-[state=inactive]:text-slate-700 data-[state=inactive]:dark:text-slate-300 justify-start w-full"
        >
          {t("user.profile.tabs.security")}
        </TabsTrigger>
        <TabsTrigger 
          value="privacy" 
          className="px-3 py-2 rounded-lg text-sm font-medium data-[state=active]:font-bold data-[state=active]:bg-slate-100 data-[state=active]:dark:bg-slate-800 data-[state=active]:text-primary data-[state=inactive]:text-slate-700 data-[state=inactive]:dark:text-slate-300 justify-start w-full"
        >
          {t("user.profile.tabs.privacy")}
        </TabsTrigger>
      </TabsList>
    </>
  )
}