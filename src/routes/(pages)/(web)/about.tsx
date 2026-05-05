import { createFileRoute } from '@tanstack/react-router'
import { useAppTranslation } from '@/lib/i18n-typed'
import PageTitle from '@/components/app/PageTitle'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/(pages)/(web)/about')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useAppTranslation()

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageTitle
        title={t($ => $.web.about.title)}
        description={t($ => $.web.about.description)}
      />

      <Card>
        <CardContent className="flex flex-col gap-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.about.mission.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.about.mission.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.about.vision.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.about.vision.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.about.values.title)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{t($ => $.web.about.values.innovation)}</h3>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                  {t($ => $.web.about.values.innovationDesc)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{t($ => $.web.about.values.accessibility)}</h3>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                  {t($ => $.web.about.values.accessibilityDesc)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{t($ => $.web.about.values.quality)}</h3>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                  {t($ => $.web.about.values.qualityDesc)}
                </p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{t($ => $.web.about.values.community)}</h3>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                  {t($ => $.web.about.values.communityDesc)}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              {t($ => $.web.about.team.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.about.team.content)}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t($ => $.web.about.history.title)}
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {t($ => $.web.about.history.content)}
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
