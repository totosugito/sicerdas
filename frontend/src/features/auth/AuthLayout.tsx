import { useAppTranslation } from '@/lib/i18n-typed';
import { Link } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme-provider";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Sun,
  Moon,
  Monitor,
  Languages,
  ArrowLeft,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Shield,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_CONFIG } from "@/constants/config";
import { AppLogo } from "@/features/app";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { t, i18n } = useAppTranslation();
  const { theme, setTheme } = useTheme();
  const { setLanguage } = useAuthStore();

  const handleLanguageChange = (lang: "id" | "en") => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <div className="min-h-screen w-full flex bg-background text-foreground relative overflow-hidden">
      {/* Decorative ambient background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/20 dark:bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      {/* Top Header Bar for Quick Actions (Back, Theme, Lang) */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-auto">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground backdrop-blur-md bg-background/60 dark:bg-card/60 border border-border/40 shadow-xs hover:shadow-sm transition-all"
            />
          }
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:inline">{t(($) => $.labels.back)}</span>
        </Button>

        <div className="flex items-center gap-1.5 backdrop-blur-md bg-background/60 dark:bg-card/60 border border-border/40 p-1 rounded-lg shadow-xs">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors focus:outline-none"
                  aria-label="Language switch"
                />
              }
            >
              <Languages className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              <DropdownMenuItem
                onClick={() => handleLanguageChange("id")}
                className={i18n.language === "id" ? "font-bold text-primary" : ""}
              >
                🇮🇩 Bahasa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleLanguageChange("en")}
                className={i18n.language === "en" ? "font-bold text-primary" : ""}
              >
                🇬🇧 English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="h-7 w-7 rounded-md inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors focus:outline-none"
                  aria-label="Toggle theme"
                />
              }
            >
              {theme === "light" && <Sun className="w-3.5 h-3.5 text-amber-500" />}
              {theme === "dark" && <Moon className="w-3.5 h-3.5 text-blue-400" />}
              {theme === "system" && <Monitor className="w-3.5 h-3.5" />}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>{t(($) => $.labels.light)}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-400" />
                <span>{t(($) => $.labels.dark)}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                <span>{t(($) => $.labels.system)}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Left side: Premium Brand Showcase (Hidden on Mobile/Tablet, visible on lg+) */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/15 dark:from-primary/20 dark:via-background dark:to-card border-r border-border/40 overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.03] dark:opacity-[0.06]" />

        {/* Glow ball */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-primary/25 blur-3xl pointer-events-none" />

        {/* Brand Logo Header */}
        <div className="relative z-10 pt-4">
          <AppLogo size={48} textSize="2xl" withDescription />
        </div>

        {/* Hero Content / Feature Highlights */}
        <div className="relative z-10 my-auto py-8 max-w-lg space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t(($) => $.auth.layout.badge)}</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              {t(($) => $.auth.layout.heroTitle)}{" "}
              <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                {APP_CONFIG?.app?.name}
              </span>
            </h2>
            <p className="text-muted-foreground text-sm xl:text-base leading-relaxed">
              {t(($) => $.auth.layout.heroDescription)}
            </p>
          </div>

          {/* Value props bullets */}
          <div className="space-y-3.5 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {t(($) => $.auth.layout.feature1Title)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {t(($) => $.auth.layout.feature1Description)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {t(($) => $.auth.layout.feature2Title)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {t(($) => $.auth.layout.feature2Description)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-sm border border-border/50 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {t(($) => $.auth.layout.feature3Title)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {t(($) => $.auth.layout.feature3Description)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{t(($) => $.auth.layout.footerTrust)}</span>
          </div>
          <span>© {new Date().getFullYear()} {APP_CONFIG?.app?.name}</span>
        </div>
      </div>

      {/* Right side: Auth Card Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10 overflow-y-auto">
        <div className="w-full max-w-[440px] my-auto py-10">
          {/* Mobile Logo Branding (visible only on small screens) */}
          <div className="lg:hidden flex flex-col items-center text-center mb-6">
            <AppLogo size={40} textSize="xl" />
          </div>

          {/* Main Card */}
          <div className="relative bg-card/85 dark:bg-card/75 backdrop-blur-2xl rounded-3xl border border-border/70 shadow-xl dark:shadow-2xl shadow-primary/5 p-6 sm:p-8 transition-all hover:border-primary/30">
            {/* Top glowing accent border line */}
            <div className="absolute -top-[1px] left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full" />
            
            {children}
          </div>

          {/* Bottom Copyright on mobile */}
          <div className="mt-8 text-center text-xs text-muted-foreground/70">
            <p>© {new Date().getFullYear()} {t($ => $.app.copyright)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}