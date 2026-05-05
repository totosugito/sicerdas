import { createFileRoute } from '@tanstack/react-router'
import { useAppTranslation } from '@/lib/i18n-typed'
import { APP_CONFIG } from '@/constants/config'
import PageTitle from '@/components/app/PageTitle'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/(pages)/(web)/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useAppTranslation()

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageTitle
        title={t($ => $.web.terms.title)}
        description={
          <div className="flex flex-col gap-1">
            <p>{t($ => $.web.terms.description)}</p>
            <p className="text-xs">{t($ => $.web.terms.updated, { date: "25 November 2025" })}</p>
          </div>
        }
      />

      <Card>
        <CardContent className="flex flex-col gap-6">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.terms.acceptance.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.terms.acceptance.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.terms.useOfService.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.terms.useOfService.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.terms.intellectualProperty.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.terms.intellectualProperty.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.terms.userAccounts.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.terms.userAccounts.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.terms.termination.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.terms.termination.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.terms.disclaimer.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.terms.disclaimer.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.terms.limitationOfLiability.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.terms.limitationOfLiability.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.terms.changesToTerms.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.terms.changesToTerms.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.terms.contact.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.terms.contact.content)}
            </p>
            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-md">
              <p className="text-slate-700 dark:text-slate-300">
                {t($ => $.labels.email)}: <a href={`mailto:${APP_CONFIG.app.mailTo}`} className='hover:text-primary transition-colors'>{APP_CONFIG.app.mailTo}</a>
              </p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
