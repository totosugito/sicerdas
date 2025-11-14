import { useTranslation } from 'react-i18next'

export function ProfileHeader() {
  const { t } = useTranslation()
  
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-[-0.033em]">
        {t("user.profile.title")}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
        {t("user.profile.description")}
      </p>
    </div>
  )
}