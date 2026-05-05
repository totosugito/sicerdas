import { createFileRoute } from '@tanstack/react-router'
import { useAppTranslation } from '@/lib/i18n-typed'
import PageTitle from '@/components/app/PageTitle'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/(pages)/(web)/faq')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useAppTranslation()

  const faqItems = [
    {
      question: t($ => $.web.faq.questions.whatIsSicerdas.question),
      answer: t($ => $.web.faq.questions.whatIsSicerdas.answer)
    },
    {
      question: t($ => $.web.faq.questions.howToRegister.question),
      answer: t($ => $.web.faq.questions.howToRegister.answer)
    },
    {
      question: t($ => $.web.faq.questions.isThereCost.question),
      answer: t($ => $.web.faq.questions.isThereCost.answer)
    },
    {
      question: t($ => $.web.faq.questions.offlineAccess.question),
      answer: t($ => $.web.faq.questions.offlineAccess.answer)
    },
    {
      question: t($ => $.web.faq.questions.supportContact.question),
      answer: t($ => $.web.faq.questions.supportContact.answer)
    }
  ]

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageTitle
        title={t($ => $.web.faq.title)}
        description={t($ => $.web.faq.description)}
      />

      <Card>
        <CardContent className="flex flex-col gap-6">
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
        </CardContent>
      </Card>
    </div>
  )
}
