import { motion } from 'framer-motion'
import { Search, BookOpen, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AppRoute } from '@/constants/app-route'

interface HeroSectionProps {
    searchQuery: string
    setSearchQuery: (query: string) => void
    handleSearch: (e: React.FormEvent) => void
}

export function HeroSection({ searchQuery, setSearchQuery, handleSearch }: HeroSectionProps) {
    const { t } = useTranslation()

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 py-10">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto text-center"
                >
                    <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                        {t('landing.hero.title')}
                        <div className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> {t('landing.hero.highlight')}</div>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        {t('landing.hero.subtitle')}
                    </p>

                    {/* Search Bar */}
                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        onSubmit={handleSearch}
                        className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder={t('landing.hero.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-card border-border"
                            />
                        </div>
                        <Button type="submit" className="px-8">
                            {t('landing.hero.searchButton')}
                        </Button>
                    </motion.form>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <Link to={AppRoute.books.latest.url}>
                            <Button className='gap-2'>
                                <BookOpen className="h-5 w-5" />
                                {t('landing.hero.exploreBooks')}
                            </Button>
                        </Link>
                        <Link to={AppRoute.quiz.quiz.url}>
                            <Button variant="outline" className='gap-2'>
                                <Trophy className="h-5 w-5" />
                                {t('landing.hero.takeQuiz')}
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl" />
        </section>
    )
}
