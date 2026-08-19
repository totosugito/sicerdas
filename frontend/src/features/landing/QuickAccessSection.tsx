import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { BookOpen, Atom, Scale, Award, ArrowUpRight, Sparkles } from "lucide-react";
import { AppRoute } from "@/constants/app-route";
import { Card, CardContent } from "@/components/ui/card";
import { useAppTranslation } from "@/lib/i18n-typed";

export function QuickAccessSection() {
  const { t } = useAppTranslation();

  const portals = [
    {
      title: t(($) => $.landing.navbar.books.title),
      subtitle: t(($) => $.landing.quickAccess.portals.books.subtitle),
      icon: BookOpen,
      to: AppRoute.book.books.url,
      badge: t(($) => $.landing.quickAccess.portals.books.badge),
      color: "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
      accentBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      tags: ["KTSP 2006", "K13", "Kurikulum Merdeka"],
    },
    {
      title: t(($) => $.landing.navbar.periodicTable.title),
      subtitle: t(($) => $.landing.quickAccess.portals.periodicTable.subtitle),
      icon: Atom,
      to: AppRoute.periodicTable.periodicTable.url,
      badge: t(($) => $.landing.quickAccess.portals.periodicTable.badge),
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      accentBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      tags: ["118 Unsur", "Isotop", "Kamus Kimia"],
    },
    {
      title: t(($) => $.landing.navbar.constitution.title),
      subtitle: t(($) => $.landing.quickAccess.portals.constitution.subtitle),
      icon: Scale,
      to: AppRoute.constitution.pancasila.url,
      badge: t(($) => $.landing.quickAccess.portals.constitution.badge),
      color: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
      accentBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      tags: ["Pancasila", "UUD 1945", "Amandemen I-IV"],
    },
    {
      title: t(($) => $.landing.navbar.quiz.title),
      subtitle: t(($) => $.landing.quickAccess.portals.quiz.subtitle),
      icon: Award,
      to: AppRoute.exam.exams.url,
      badge: t(($) => $.landing.quickAccess.portals.quiz.badge),
      color: "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
      accentBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      tags: ["UTBK / SNBT", "CPNS", "Simulasi Mandiri"],
    },
  ];

  return (
    <section className="py-8 md:py-12 px-4 sm:px-6 relative overflow-hidden bg-muted/30">
      {/* Background soft gradients */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-2 border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            {t(($) => $.landing.quickAccess.badge)}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            {t(($) => $.landing.quickAccess.title)}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mt-2">
            {t(($) => $.landing.quickAccess.subtitle)}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {portals.map((portal, index) => {
            const Icon = portal.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <Link to={portal.to} className="block h-full group outline-none">
                  <Card className="h-full relative overflow-hidden bg-card/80 backdrop-blur-sm border-border/80 hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer">
                    {/* Top gradient glow on hover */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <CardContent className="p-4 sm:p-5 flex flex-col h-full justify-between gap-3 sm:gap-4">
                      <div>
                        {/* Header: Icon + Badge + Arrow */}
                        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
                          <div
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${portal.accentBg} transition-transform group-hover:scale-110 duration-300 shadow-sm`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border/60">
                              {portal.badge}
                            </span>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-muted/60 text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                              <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1">
                          {portal.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {portal.subtitle}
                        </p>
                      </div>

                      {/* Tag Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/40">
                        {portal.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-background/80 text-foreground/70 border border-border/50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
