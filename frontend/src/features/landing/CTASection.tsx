import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Sparkles, Smartphone } from "lucide-react";
import { AppRoute } from "@/constants/app-route";
import { APP_CONFIG } from "@/constants/config";

export function CTASection() {
  const { t } = useAppTranslation();

  return (
    <section className="py-8 md:py-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-card to-accent/15 p-6 sm:p-8 md:p-10 border border-primary/20 shadow-xl shadow-primary/5 text-center sm:text-left"
        >
          {/* Background Ambient Glows */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* Inner Content */}
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3 border border-primary/20 backdrop-blur-xs">
              <Sparkles className="h-3.5 w-3.5" />
              {t(($) => $.landing.cta.badge)}
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight leading-tight mb-3">
              {t(($) => $.landing.cta.title)}
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
              {t(($) => $.landing.cta.subtitle)}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link to={AppRoute.book.books.url} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto font-semibold gap-2 shadow-md shadow-primary/20 cursor-pointer">
                  <BookOpen className="h-4 w-4" />
                  <span>{t(($) => $.landing.hero.exploreBooks)}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <Button
                variant="outline"
                className="w-full sm:w-auto font-semibold gap-2 bg-card/80 backdrop-blur-sm border-border/80 hover:bg-muted cursor-pointer"
                onClick={() => {
                  window.open(APP_CONFIG.app.playStore, "_blank");
                }}
              >
                <Smartphone className="h-4 w-4 text-emerald-500" />
                <span>{t(($) => $.landing.cta.downloadAndroid)}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
