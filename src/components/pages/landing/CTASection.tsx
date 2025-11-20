import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

export function CTASection() {
    const { t } = useTranslation()

    return (
        <section className="py-20 bg-gradient-to-r from-primary to-accent text-primary-foreground dark:from-primary/40 dark:to-accent/40 dark:text-foreground bg-opacity-80">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('landing.cta.title')}
                    </h2>
                    <p className="text-lg mb-8 text-primary-foreground/90 dark:text-foreground">
                        {t('landing.cta.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/books/latest">
                            <Button size="lg" variant="secondary" className="dark:bg-secondary/70 dark:text-secondary-foreground dark:hover:bg-secondary/60">
                                {t('landing.cta.exploreResources')}
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary dark:border-foreground/70 dark:text-foreground dark:hover:bg-foreground/30 dark:hover:text-foreground dark:hover:border-foreground/90"
                        >
                            {t('landing.cta.createAccount')}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
