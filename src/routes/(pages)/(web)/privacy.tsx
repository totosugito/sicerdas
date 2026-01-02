import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { APP_CONFIG } from '@/constants/config'

export const Route = createFileRoute('/(pages)/(web)/privacy')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-[-0.033em]">
          {t("web.privacy.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
          {t("web.privacy.description")}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          {t("web.privacy.updated", { date: "25 November 2025" })}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.privacy.introduction.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.privacy.introduction.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.privacy.informationWeCollect.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.privacy.informationWeCollect.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.privacy.howWeUseInformation.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.privacy.howWeUseInformation.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.privacy.dataSharing.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.privacy.dataSharing.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.privacy.dataSecurity.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.privacy.dataSecurity.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.privacy.yourRights.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.privacy.yourRights.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.privacy.cookies.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.privacy.cookies.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.privacy.changesToPolicy.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.privacy.changesToPolicy.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.privacy.contactUs.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.privacy.contactUs.content")}
            </p>
            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-md">
              <p className="text-slate-700 dark:text-slate-300">
                {t("labels.email")}: <a href={`mailto:${APP_CONFIG.app.mailTo}`} className='hover:text-primary transition-colors'>{APP_CONFIG.app.mailTo}</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}