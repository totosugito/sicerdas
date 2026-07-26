import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAppTranslation } from '@/lib/i18n-typed'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Heart, LogIn } from 'lucide-react'
import { AppRoute } from '@/constants/app-route'

export function CTASection() {
    const { t } = useAppTranslation()

    return (
        <section className="py-10 px-6">
            <div className="container mx-auto max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="relative overflow-hidden rounded-3xl bg-card p-6 md:p-8 shadow-xl border border-border/50"
                >
                    {/* Consistent Background Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-accent/[0.08] pointer-events-none" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary-soft),transparent)] pointer-events-none opacity-40" />

                    {/* Floating Background Elements */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-24 -left-24 w-80 h-80 bg-accent/10 rounded-full blur-[100px] pointer-events-none"
                    />

                    {/* Content */}
                    <div className="relative z-10 max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-4 tracking-tight">
                            {t($ => $.landing.cta.title)}
                        </h2>
                        <p className="mb-6 text-muted-foreground text-lg font-medium leading-relaxed">
                            {t($ => $.landing.cta.subtitle)}
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 mt-8">
                            <Link to={AppRoute.book.books.url}>
                                <Button className="px-8 shadow-lg shadow-primary/20 group transition-all duration-300">
                                    <div className='flex flex-row gap-3 items-center font-bold'>
                                        <span>{t($ => $.landing.hero.exploreBooks)}</span>
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Subtle grain/noise for texture (Theme-Aware opacity) */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                </motion.div>
            </div>
        </section>
    )
}
