import { motion } from 'framer-motion'
import { BookOpen, GraduationCap, Trophy, Users, Clock, Shield, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslation } from 'react-i18next'

const featureIcons = [BookOpen, GraduationCap, Trophy, Users, Clock, Shield, Zap]

export function FeaturesSection() {
    const { t } = useTranslation()

    const features = [
        {
            icon: featureIcons[0],
            title: t('landing.features.items.library.title'),
            description: t('landing.features.items.library.description'),
        },
        {
            icon: featureIcons[1],
            title: t('landing.features.items.interactive.title'),
            description: t('landing.features.items.interactive.description'),
        },
        {
            icon: featureIcons[2],
            title: t('landing.features.items.exam.title'),
            description: t('landing.features.items.exam.description'),
        },
        {
            icon: featureIcons[3],
            title: t('landing.features.items.collaborative.title'),
            description: t('landing.features.items.collaborative.description'),
        },
        {
            icon: featureIcons[6],
            title: t('landing.features.items.fast.title'),
            description: t('landing.features.items.fast.description'),
        },
        {
            icon: featureIcons[5],
            title: t('landing.features.items.quality.title'),
            description: t('landing.features.items.quality.description'),
        }
    ]

    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                        {t('landing.features.title')}
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        {t('landing.features.subtitle')}
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-border">
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                        <feature.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-muted-foreground">
                                        {feature.description}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
