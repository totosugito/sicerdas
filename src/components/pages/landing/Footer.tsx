import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { APP_CONFIG } from '@/constants/config'
import { RiDiscordLine, RiMailLine, RiYoutubeLine } from 'react-icons/ri'
import { AppRoute } from '@/constants/app-route'

export function Footer() {
    const { t } = useTranslation()

    return (
        <footer className="bg-card border-t border-border py-6">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <img src={APP_CONFIG.app.logo} alt={APP_CONFIG.app.name} className="h-12 w-12" />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('app.appName')}</span>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {t('landing.footer.brand.description')}
                        </p>
                    </div>

                    {/* Information Links */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">{t('landing.footer.information.title')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href={AppRoute.web.about.url} className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.information.about')}</a></li>
                            <li><a href={AppRoute.web.privacy.url} className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.information.privacy')}</a></li>
                            <li><a href={AppRoute.web.terms.url} className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.information.terms')}</a></li>
                            <li><a href={AppRoute.web.support.url} className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.information.support')}</a></li>
                            <li><a href={AppRoute.web.faq.url} className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.information.faq')}</a></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">{t('landing.footer.quickLinks.title')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to={AppRoute.books.latest.url} className="text-muted-foreground hover:text-primary transition-colors">
                                    {t('landing.footer.quickLinks.latestBooks')}
                                </Link>
                            </li>
                            <li><a href={AppRoute.constitution.pancasila.url} className="text-muted-foreground hover:text-primary transition-colors">{t('landing.navbar.constitution.pancasila')}</a></li>
                            <li><a href={AppRoute.periodicTable.periodicTable.url} className="text-muted-foreground hover:text-primary transition-colors">{t('landing.navbar.periodicTable')}</a></li>
                            <li><a href={APP_CONFIG.app.playStore} target='_blank' className="text-muted-foreground hover:text-primary transition-colors">{t('landing.footer.quickLinks.androidApp')}</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">{t('landing.footer.contact.title')}</h3>
                        <div className="space-y-3">
                            <a href={APP_CONFIG.app.youtubeChannel} target='_blank' className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                                <RiYoutubeLine className="h-5 w-5" />
                                <span className="text-sm">{t('landing.footer.contact.youtube')}</span>
                            </a>
                            <a href={APP_CONFIG.app.discord} target='_blank' className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                                <RiDiscordLine className="h-5 w-5" />
                                <span className="text-sm">{t('landing.footer.contact.discord')}</span>
                            </a>
                            <a href={`mailto:${APP_CONFIG.app.mailTo}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                                <RiMailLine className="h-5 w-5" />
                                <span className="text-sm">{APP_CONFIG.app.mailTo}</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-4 text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} {t('app.copyright')}</p>
                </div>
            </div>
        </footer>
    )
}
