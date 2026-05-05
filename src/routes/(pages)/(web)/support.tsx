import { createFileRoute } from '@tanstack/react-router'
import { useAppTranslation } from '@/lib/i18n-typed'
import { APP_CONFIG } from '@/constants/config'
import PageTitle from '@/components/app/PageTitle'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/(pages)/(web)/support')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useAppTranslation()

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageTitle
        title={t($ => $.web.support.title)}
        description={t($ => $.web.support.description)}
      />

      <Card>
        <CardContent className="flex flex-col gap-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.support.gettingStarted.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.support.gettingStarted.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.support.troubleshooting.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.support.troubleshooting.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.support.contact.title)}
            </h2>
            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-700 rounded-md">
              <p className="text-slate-700 dark:text-slate-300">
                {t($ => $.labels.email)}: <a href={`mailto:${APP_CONFIG.app.mailTo}`} className='hover:text-primary transition-colors'>{APP_CONFIG.app.mailTo}</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.support.feedback.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.support.feedback.content)}
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
