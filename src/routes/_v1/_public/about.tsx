import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_v1/_public/about')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-[-0.033em]">
          {t("public.about.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
          {t("public.about.description")}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("public.about.mission.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("public.about.mission.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("public.about.vision.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("public.about.vision.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("public.about.values.title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{t("public.about.values.innovation")}</h3>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                  {t("public.about.values.innovationDesc")}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{t("public.about.values.accessibility")}</h3>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                  {t("public.about.values.accessibilityDesc")}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{t("public.about.values.quality")}</h3>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                  {t("public.about.values.qualityDesc")}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{t("public.about.values.community")}</h3>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                  {t("public.about.values.communityDesc")}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("public.about.team.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("public.about.team.content")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t("public.about.history.title")}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t("public.about.history.content")}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}