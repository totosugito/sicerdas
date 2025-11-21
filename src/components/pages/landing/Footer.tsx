import { BookOpen, Youtube, Instagram, Mail } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function Footer() {
    const { t } = useTranslation()

    return (
        <footer className="bg-card border-t border-border py-12">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <span className="text-xl font-bold text-foreground">{t('app.appName')}</span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {t('landing.footer.brand.description')}
                        </p>
                    </div>

                    {/* Information Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">{t('landing.footer.information.title')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.information.about')}</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.information.privacy')}</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.information.terms')}</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.information.support')}</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.information.faq')}</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">{t('landing.footer.quickLinks.title')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/books/latest" className="text-muted-foreground hover:text-primary transition-colors">
                                    {t('landing.footer.quickLinks.latestBooks')}
                                </Link>
                            </li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.quickLinks.quizLibrary')}</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.quickLinks.studyGuide')}</a></li>
                            <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.quickLinks.mobileApp')}</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">{t('landing.footer.contact.title')}</h3>
                        <div className="space-y-3">
                            <a href="#" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                                <Youtube className="h-5 w-5" />
                                <span className="text-sm">{t('landing.footer.contact.youtube')}</span>
                            </a>
                            <a href="#" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                                <Instagram className="h-5 w-5" />
                                <span className="text-sm">{t('landing.footer.contact.instagram')}</span>
                            </a>
                            <a href="mailto:contact@sicerdas.id" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                                <Mail className="h-5 w-5" />
                                <span className="text-sm">{t('landing.footer.contact.email')}</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} {t('app.copyright')}</p>
                </div>
            </div>
        </footer>
    )
}
