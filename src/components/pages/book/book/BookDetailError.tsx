import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { AppRoute } from '@/constants/app-route'

interface BookDetailErrorProps {
    message?: string
}

export function BookDetailError({ message }: BookDetailErrorProps) {
    const { t } = useTranslation()

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md space-y-8">
                <div className="relative flex justify-center">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full blur-3xl opacity-50 transform scale-150" />

                    <div className="relative bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                        <AlertTriangle className="w-12 h-12 text-red-500 fill-red-50 dark:fill-red-900/20" />
                    </div>
                </div>

                <div className="space-y-3 relative">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                        {message || t('book.detail.notFound')}
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400">
                        {t('book.detail.notFoundDesc')}
                    </p>
                </div>

                <div className="relative">
                    <Link to={AppRoute.book.books.url}>
                        <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all rounded-full">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            {t('book.detail.backToBooks')}
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
