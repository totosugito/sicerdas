import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'

export function CTASection() {
    const { t } = useTranslation()

    return (
        <section className="py-20 bg-gradient-to-r from-primary to-accent text-primary-foreground">
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
                    <p className="text-lg mb-8 text-primary-foreground/90">
                        {t('landing.cta.subtitle')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/books/latest">
                            <Button size="lg" variant="secondary">
                                {t('landing.cta.exploreResources')}
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                        >
                            {t('landing.cta.createAccount')}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
