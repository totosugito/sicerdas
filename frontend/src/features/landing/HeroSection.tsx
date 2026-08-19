import { motion } from "framer-motion";
import { Search, Sparkles, X, ArrowRight, Smartphone, BookMarked, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppTranslation } from "@/lib/i18n-typed";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.SyntheticEvent) => void;
}

export function HeroSection({ searchQuery, setSearchQuery, handleSearch }: HeroSectionProps) {
  const { t } = useAppTranslation();

  const stats = [
    { label: t(($) => $.landing.hero.stats.books), value: "9,000+", icon: BookMarked },
    { label: t(($) => $.landing.hero.stats.access), value: "100%", icon: CheckCircle2 },
    { label: t(($) => $.landing.hero.stats.multiplatform), value: t(($) => $.landing.hero.stats.multiplatformVal), icon: Smartphone },
  ];

  return (
    <section className="py-8 md:py-12 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Background ambient lighting and subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-br from-primary/20 via-accent/15 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Centered Heading & Search Box */}
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium mb-4 shadow-sm backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{t(($) => $.landing.hero.badge)}</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-[1.15] mb-4"
          >
            {t(($) => $.landing.hero.title)}{" "}
            <span className="bg-gradient-to-r from-primary via-blue-600 to-indigo-500 bg-clip-text text-transparent underline decoration-primary/30 decoration-wavy decoration-from-font">
              {t(($) => $.landing.hero.highlight)}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed font-normal"
          >
            {t(($) => $.landing.hero.subtitle)}
          </motion.p>

          {/* Search Card / Floating Input */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <form
              onSubmit={handleSearch}
              className="relative flex items-center p-1.5 rounded-2xl bg-card/90 dark:bg-card/70 backdrop-blur-md border border-border shadow-lg shadow-primary/5 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all duration-300"
            >
              <div className="pl-3 pr-2 text-muted-foreground flex items-center justify-center pointer-events-none">
                <Search className="h-4 w-4 text-primary/80" />
              </div>

              <Input
                type="text"
                placeholder={t(($) => $.landing.hero.searchPlaceholder)}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-0 shadow-none focus-visible:ring-0 text-sm sm:text-base placeholder:text-muted-foreground/70 h-9 px-2"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/60 transition-colors mr-1 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              <Button
                type="submit"
                className="shrink-0 gap-1.5 cursor-pointer font-semibold shadow-xs"
              >
                <span>{t(($) => $.landing.hero.searchButton)}</span>
                <ArrowRight className="h-3.5 w-3.5 hidden sm:inline-block" />
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Stats Bar (Full 6xl Width to match the portal cards below) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 w-full pt-5 border-t border-border/60"
        >
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl bg-card/40 border border-border/40 text-left backdrop-blur-2xs"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-bold text-foreground tracking-tight">{item.value}</div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{item.label}</div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
