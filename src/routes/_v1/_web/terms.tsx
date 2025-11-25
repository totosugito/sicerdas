import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { APP_CONFIG } from '@/constants/config'

export const Route = createFileRoute('/_v1/_web/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-[-0.033em]">
          {t("web.terms.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
          {t("web.terms.description")}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          {t("web.terms.updated", { date: "25 November 2025" })}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.terms.acceptance.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.terms.acceptance.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.terms.useOfService.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.terms.useOfService.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.terms.intellectualProperty.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.terms.intellectualProperty.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.terms.userAccounts.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.terms.userAccounts.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.terms.termination.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.terms.termination.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.terms.disclaimer.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.terms.disclaimer.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.terms.limitationOfLiability.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.terms.limitationOfLiability.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.terms.changesToTerms.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.terms.changesToTerms.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("web.terms.contact.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("web.terms.contact.content")}
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