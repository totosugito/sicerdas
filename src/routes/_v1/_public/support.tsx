import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { APP_CONFIG } from '@/constants/config'

export const Route = createFileRoute('/_v1/_public/support')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-[-0.033em]">
          {t("public.support.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
          {t("public.support.description")}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("public.support.gettingStarted.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("public.support.gettingStarted.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("public.support.troubleshooting.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("public.support.troubleshooting.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("public.support.contact.title")}
            </h2>
            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-md">
              <p className="text-slate-700 dark:text-slate-300">
                {t("labels.email")}: <a href={`mailto:${APP_CONFIG.app.mailTo}`} className='hover:text-primary transition-colors'>{APP_CONFIG.app.mailTo}</a>
              </p>
            </div>
            {/* <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-md">
              <p className="text-slate-700 dark:text-slate-300">
                {t("public.support.contact.email")}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                {t("public.support.contact.phone")}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                {t("public.support.contact.hours")}
              </p>
            </div> */}
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("public.support.feedback.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("public.support.feedback.content")}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}