import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Trophy, Users, Zap, ShieldCheck, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppTranslation } from "@/lib/i18n-typed";

export function FeaturesSection() {
  const { t } = useAppTranslation();

  const features = [
    {
      icon: BookOpen,
      title: t(($) => $.landing.features.items.library.title),
      description: t(($) => $.landing.features.items.library.description),
      gradient: "from-blue-500/10 via-indigo-500/5 to-transparent",
      iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      accent: "blue",
    },
    {
      icon: GraduationCap,
      title: t(($) => $.landing.features.items.interactive.title),
      description: t(($) => $.landing.features.items.interactive.description),
      gradient: "from-emerald-500/10 via-teal-500/5 to-transparent",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      accent: "emerald",
    },
    {
      icon: Trophy,
      title: t(($) => $.landing.features.items.exam.title),
      description: t(($) => $.landing.features.items.exam.description),
      gradient: "from-amber-500/10 via-orange-500/5 to-transparent",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      accent: "amber",
    },
    {
      icon: Users,
      title: t(($) => $.landing.features.items.collaborative.title),
      description: t(($) => $.landing.features.items.collaborative.description),
      gradient: "from-purple-500/10 via-pink-500/5 to-transparent",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      accent: "purple",
    },
    {
      icon: Zap,
      title: t(($) => $.landing.features.items.fast.title),
      description: t(($) => $.landing.features.items.fast.description),
      gradient: "from-cyan-500/10 via-sky-500/5 to-transparent",
      iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
      accent: "cyan",
    },
    {
      icon: ShieldCheck,
      title: t(($) => $.landing.features.items.quality.title),
      description: t(($) => $.landing.features.items.quality.description),
      gradient: "from-rose-500/10 via-red-500/5 to-transparent",
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      accent: "rose",
    },
  ];

  return (
    <section className="py-8 md:py-12 px-4 sm:px-6 bg-background relative overflow-hidden">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2 border border-primary/20">
            <Zap className="h-3.5 w-3.5" />
            {t(($) => $.landing.features.badge)}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            {t(($) => $.landing.features.title)}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mt-2">
            {t(($) => $.landing.features.subtitle)}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ y: -4 }}
                className="h-full"
              >
                <Card className="h-full relative overflow-hidden bg-card/70 backdrop-blur-sm border-border/80 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group">
                  {/* Subtle top background highlight */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-50 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                  />

                  <CardContent className="p-5 sm:p-6 relative z-10 flex flex-col h-full justify-between gap-3 sm:gap-4">
                    <div>
                      {/* Icon header */}
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center border shadow-xs ${feature.iconBg} group-hover:scale-105 transition-transform duration-300`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="w-6 h-6 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors mb-1.5">
                        {feature.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
