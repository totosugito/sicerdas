import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Heart, LogIn } from 'lucide-react'
import { AppRoute } from '@/constants/app-route'

export function CTASection() {
    const { t } = useTranslation()

    return (
        <section className="py-20 px-8">
            <div className="container mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 md:p-16"
                >
                    {/* Content */}
                    <div className="relative z-10 max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            {t('landing.cta.title')}
                        </h2>
                        <p className="mb-6 text-muted-foreground">
                            {t('landing.cta.subtitle')}
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to={AppRoute.books.latest.url}>
                                <Button>
                                    <div className='flex flex-row gap-4 items-center'>
                                    <span>{t('landing.hero.exploreBooks')}</span>
                                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Decorative gradient orbs */}
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
                </motion.div>
            </div>
        </section>
    )
}
