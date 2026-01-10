import { motion } from 'framer-motion'
import { Smartphone, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { IoLogoGooglePlaystore, IoLogoYoutube } from 'react-icons/io5'
import { APP_CONFIG } from '@/constants/config'

export function AndroidAppSection() {
    const { t } = useTranslation()

    // Sample images for the carousel (in a real app, these would be actual image URLs)
    const mockupImages = APP_CONFIG.app.androidImages || []

    const [currentIndex, setCurrentIndex] = useState(0)

    const appFeatures = [
        t('landing.androidApp.benefits.offline'),
        t('landing.androidApp.benefits.notifications'),
        t('landing.androidApp.benefits.performance'),
        t('landing.androidApp.benefits.sync'),
        t('landing.androidApp.benefits.exclusive')
    ]

    // Change image every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 1) % mockupImages.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [mockupImages.length])

    return (
        <section className="py-10 px-6 bg-gradient-to-br from-accent/5 via-background to-primary/5">
            <div className="container mx-auto">
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
                                {t('landing.androidApp.badge')}
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
                                <Button className="gap-2" onClick={() => {
                                    window.open(APP_CONFIG.app.playStore, '_blank')
                                }}>
                                    <IoLogoGooglePlaystore className="h-5 w-5" />
                                    {t('landing.androidApp.downloadButton')}
                                </Button>
                                <Button variant="outline" className="gap-2" onClick={() => {
                                    window.open(APP_CONFIG.app.youtubeDemo, '_blank')
                                }}>
                                    <IoLogoYoutube className="h-5 w-5" />
                                    {t('landing.androidApp.watchDemo')}
                                </Button>
                            </div>
                        </div>

                        {/* Right - App Mockup with Image Carousel */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="relative"
                        >
                            <div className="relative w-full max-w-xs mx-auto">
                                {/* Phone mockup with image carousel */}
                                <div className="aspect-[9/19] bg-gradient-to-br from-primary to-accent rounded-[2.5rem] shadow-2xl p-2">
                                    <div className="w-full h-full bg-background rounded-[2rem] overflow-hidden">
                                        {/* Image display */}
                                        <div className="w-full h-full flex items-center justify-center">
                                            <img
                                                src={mockupImages[currentIndex]}
                                                alt={`App screen ${currentIndex + 1}`}
                                                className="w-full h-full rounded-lg"
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2.5rem] blur-2xl -z-10" />
                            </div>

                            {/* Carousel navigation buttons */}
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
                                {mockupImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                            ? 'bg-primary w-6'
                                            : 'bg-muted'
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}