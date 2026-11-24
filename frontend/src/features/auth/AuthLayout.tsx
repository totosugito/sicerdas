import { useAppTranslation } from "@/lib/i18n-typed";
import { Link } from "@tanstack/react-router";
import { useTheme } from "@/lib/theme-provider";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  Sun,
  Moon,
  Monitor,
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_CONFIG } from "@/constants/config";
import { AppLogo } from "@/features/app";
import { cn } from "@/lib/utils";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { t, i18n } = useAppTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useAuthStore();

  const handleLanguageChange = (lang: "id" | "en") => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  const changeTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    useAuthStore.getState().setTheme(newTheme);
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-4 w-4" />;
      case "dark":
        return <Moon className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getLanguageFlag = () => {
    switch (language || i18n.language) {
      case "id":
        return "🇮🇩";
      case "en":
        return "🇬🇧";
      default:
        return "🇮🇩";
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground relative overflow-hidden">
      {/* Decorative ambient background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/20 dark:bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      {/* Top Header Bar aligned with standard Navbar (.navbar-size) */}
      <header className="sticky top-0 z-50 py-1 bg-card/70 flex h-12 items-center justify-between backdrop-blur-xl border-b border-border/40">
        <div className="navbar-size flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={
                <Link
                  to="/"
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-all px-2.5 rounded-xl"
                />
              }
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-medium">{t(($) => $.labels.back)}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher - Matched with AppNavbar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-xl">
                  {getLanguageFlag()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t(($) => $.labels.language)}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange("id")}
                    className={cn(
                      "my-1",
                      (language || i18n.language) === "id"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90"
                        : "hover:bg-accent focus:bg-accent",
                    )}
                  >
                    <span className="mr-2">🇮🇩</span>
                    Indonesia
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange("en")}
                    className={cn(
                      "my-1",
                      (language || i18n.language) === "en"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90"
                        : "hover:bg-accent focus:bg-accent",
                    )}
                  >
                    <span className="mr-2">🇬🇧</span>
                    English
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Switcher - Matched with AppNavbar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  {getThemeIcon()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{t(($) => $.labels.theme)}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => changeTheme("light")}
                    className={cn(
                      "my-1",
                      theme === "light"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90"
                        : "hover:bg-accent focus:bg-accent",
                    )}
                  >
                    <Sun
                      className={cn(
                        "mr-2 h-4 w-4",
                        theme === "light" ? "text-primary-foreground" : "",
                      )}
                    />
                    {t(($) => $.labels.light)}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeTheme("dark")}
                    className={cn(
                      "my-1",
                      theme === "dark"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90"
                        : "hover:bg-accent focus:bg-accent",
                    )}
                  >
                    <Moon
                      className={cn(
                        "mr-2 h-4 w-4",
                        theme === "dark" ? "text-primary-foreground" : "",
                      )}
                    />
                    {t(($) => $.labels.dark)}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => changeTheme("system")}
                    className={cn(
                      "my-1",
                      theme === "system"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90"
                        : "hover:bg-accent focus:bg-accent",
                    )}
                  >
                    <Monitor className="mr-2 h-4 w-4 text-foreground" />
                    {t(($) => $.labels.system)}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content Area aligned with standard .page-container */}
      <main className="page-container justify-center relative z-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-border/70 bg-card/85 dark:bg-card/75 backdrop-blur-2xl shadow-xl dark:shadow-2xl shadow-primary/5 overflow-hidden my-auto">
          {/* Left side: Premium Brand Showcase (Hidden on Mobile/Tablet, visible on lg+) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/15 dark:from-primary/20 dark:via-background/60 dark:to-card border-r border-border/40 overflow-hidden">
            {/* Subtle grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.03] dark:opacity-[0.06]" />

            {/* Glow ball */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-primary/25 blur-3xl pointer-events-none" />

            {/* Brand Logo Header */}
            <div className="relative z-10">
              <AppLogo size={44} textSize="2xl" withDescription />
            </div>

            {/* Hero Content / Feature Highlights */}
            <div className="relative z-10 my-auto py-8 max-w-lg space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t(($) => $.auth.layout.badge)}</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl xl:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
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
              <div className="space-y-3 pt-1">
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
              <span>
                © {new Date().getFullYear()} {APP_CONFIG?.app?.name}
              </span>
            </div>
          </div>

          {/* Right side: Auth Form Container */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center justify-center p-6 sm:p-10 xl:p-12 relative">
            {/* Top glowing accent border line */}
            <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent rounded-full" />

            <div className="w-full max-w-[400px] my-auto">
              {/* Mobile Logo Branding (visible only on small screens) */}
              <div className="lg:hidden flex flex-col items-center text-center mb-6">
                <AppLogo size={40} textSize="xl" />
              </div>

              {children}

              {/* Bottom Copyright on mobile/tablet */}
              <div className="lg:hidden mt-8 text-center text-xs text-muted-foreground/70">
                <p>
                  © {new Date().getFullYear()} {t(($) => $.app.copyright)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
