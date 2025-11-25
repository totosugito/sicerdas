import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_v1/_public/faq')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()

  const faqItems = [
    {
      question: t("public.faq.questions.whatIsSicerdas.question"),
      answer: t("public.faq.questions.whatIsSicerdas.answer")
    },
    {
      question: t("public.faq.questions.howToRegister.question"),
      answer: t("public.faq.questions.howToRegister.answer")
    },
    {
      question: t("public.faq.questions.isThereCost.question"),
      answer: t("public.faq.questions.isThereCost.answer")
    },
    {
      question: t("public.faq.questions.offlineAccess.question"),
      answer: t("public.faq.questions.offlineAccess.answer")
    },
    {
      question: t("public.faq.questions.supportContact.question"),
      answer: t("public.faq.questions.supportContact.answer")
    }
  ]

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-[-0.033em]">
          {t("public.faq.title")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal">
          {t("public.faq.description")}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          {faqItems.map((item, index) => (
            <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-6 last:border-0 last:pb-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                {item.question}
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}