import { Link } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { APP_CONFIG } from "@/constants/config";
import { RiDiscordFill, RiMailLine, RiYoutubeFill } from "react-icons/ri";
import { IoLogoGooglePlaystore } from "react-icons/io5";
import { AppRoute } from "@/constants/app-route";
import { AppLogo } from "@/features/app";

export function Footer() {
  const { t } = useAppTranslation();

  return (
    <footer className="bg-card/50 border-t border-border/80 pt-8 pb-6 px-4 sm:px-6 relative z-10">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <AppLogo />
            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-sm">
              {t(($) => $.landing.footer.brand.description)}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href={APP_CONFIG.app.youtubeChannel}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-muted/60 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground flex items-center justify-center transition-colors duration-200 border border-border/50"
              >
                <RiYoutubeFill className="h-4 w-4" />
              </a>
              <a
                href={APP_CONFIG.app.discord}
                target="_blank"
                rel="noreferrer"
                aria-label="Discord"
                className="w-8 h-8 rounded-lg bg-muted/60 hover:bg-indigo-500/10 hover:text-indigo-500 text-muted-foreground flex items-center justify-center transition-colors duration-200 border border-border/50"
              >
                <RiDiscordFill className="h-4 w-4" />
              </a>
              <a
                href={APP_CONFIG.app.playStore}
                target="_blank"
                rel="noreferrer"
                aria-label="Google Play"
                className="w-8 h-8 rounded-lg bg-muted/60 hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground flex items-center justify-center transition-colors duration-200 border border-border/50"
              >
                <IoLogoGooglePlaystore className="h-3.5 w-3.5" />
              </a>
              <a
                href={`mailto:${APP_CONFIG.app.mailTo}`}
                aria-label="Email"
                className="w-8 h-8 rounded-lg bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground flex items-center justify-center transition-colors duration-200 border border-border/50"
              >
                <RiMailLine className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:col-span-3">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-3">
              {t(($) => $.landing.footer.quickLinks.title)}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to={AppRoute.book.books.url}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <span>{t(($) => $.landing.footer.quickLinks.latestBooks)}</span>
                </Link>
              </li>
              <li>
                <Link
                  to={AppRoute.periodicTable.periodicTable.url}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <span>{t(($) => $.landing.navbar.periodicTable.title)}</span>
                </Link>
              </li>
              <li>
                <Link
                  to={AppRoute.constitution.pancasila.url}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <span>{t(($) => $.landing.navbar.constitution.pancasila)}</span>
                </Link>
              </li>
              <li>
                <Link
                  to={AppRoute.exam.exams.url}
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <span>{t(($) => $.landing.navbar.quiz.title)}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Information Links */}
          <div className="lg:col-span-3">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-3">
              {t(($) => $.landing.footer.information.title)}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link
                  to={AppRoute.web.about.url}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t(($) => $.landing.footer.information.about)}
                </Link>
              </li>
              <li>
                <Link
                  to={AppRoute.web.privacy.url}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t(($) => $.landing.footer.information.privacy)}
                </Link>
              </li>
              <li>
                <Link
                  to={AppRoute.web.terms.url}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t(($) => $.landing.footer.information.terms)}
                </Link>
              </li>
              <li>
                <Link
                  to={AppRoute.web.faq.url}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t(($) => $.landing.footer.information.faq)}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-foreground text-xs uppercase tracking-wider mb-3">
              {t(($) => $.landing.footer.contact.title)}
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="leading-relaxed">
                {t(($) => $.landing.footer.aboutDesc)}
              </p>
              <a
                href={`mailto:${APP_CONFIG.app.mailTo}`}
                className="inline-block text-primary hover:underline font-medium break-all"
              >
                {APP_CONFIG.app.mailTo}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {APP_CONFIG.app.name}. {t(($) => $.landing.footer.allRightsReserved)}</p>
          <div className="flex items-center gap-4">
            <Link to={AppRoute.web.privacy.url} className="hover:text-foreground transition-colors">
              {t(($) => $.landing.footer.information.privacy)}
            </Link>
            <span>•</span>
            <Link to={AppRoute.web.terms.url} className="hover:text-foreground transition-colors">
              {t(($) => $.landing.footer.information.terms)}
            </Link>
            <span>•</span>
            <Link to={AppRoute.web.about.url} className="hover:text-foreground transition-colors">
              {t(($) => $.landing.footer.information.about)}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
