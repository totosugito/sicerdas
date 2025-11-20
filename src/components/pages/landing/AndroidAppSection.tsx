import { motion } from 'framer-motion'
import { Smartphone, Download, Star, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export function AndroidAppSection() {
    const { t } = useTranslation()

    const appFeatures = [
        t('landing.androidApp.benefits.offline'),
        t('landing.androidApp.benefits.notifications'),
        t('landing.androidApp.benefits.performance'),
        "Sinkronisasi mulus di semua perangkat",
        t('landing.androidApp.benefits.exclusive')
    ]

    return (
        <section className="py-20 bg-gradient-to-br from-accent/5 via-background to-primary/5">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="grid md:grid-cols-2 gap-12 items-center"
                    >
                        {/* Left - Content */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                                <Smartphone className="h-4 w-4" />
                                Rilis Terbaru
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                {t('landing.androidApp.title')}
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                {t('landing.androidApp.description')}
                            </p>

                            <ul className="space-y-3 mb-8">
                                {appFeatures.map((feature, index) => (
                                    <motion.li
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                        className="flex items-center gap-3 text-foreground"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                            <Star className="h-3 w-3 text-primary" />
                                        </div>
                                        {feature}
                                    </motion.li>
                                ))}
                            </ul>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button size="lg" className="gap-2">
                                    <Download className="h-5 w-5" />
                                    {t('landing.androidApp.downloadButton')}
                                </Button>
                                <Button size="lg" variant="outline" className="gap-2">
                                    <Play className="h-5 w-5" />
                                    Tonton Demo
                                </Button>
                            </div>
                        </div>

                        {/* Right - App Mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="relative w-full max-w-sm mx-auto">
                                {/* Phone mockup */}
                                <div className="aspect-[9/19] bg-gradient-to-br from-primary to-accent rounded-[3rem] shadow-2xl p-3">
                                    <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden">
                                        <div className="p-6 space-y-4">
                                            <div className="h-16 bg-muted rounded-lg" />
                                            <div className="h-32 bg-primary/10 rounded-lg" />
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="h-24 bg-muted rounded-lg" />
                                                <div className="h-24 bg-muted rounded-lg" />
                                            </div>
                                            <div className="h-20 bg-accent/10 rounded-lg" />
                                        </div>
                                    </div>
                                </div>
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[3rem] blur-3xl -z-10" />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
