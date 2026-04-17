import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Moon, Sun, Monitor, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-provider";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuth } from "@/hooks/use-auth";
import { AppRoute } from "@/constants/app-route";
import { useLogoutMutation } from "@/api/auth/logout";
import { ModalProps, DialogModal } from "@/components/custom/components";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppNavbarMobile } from "./AppNavbarMobile";
import { AppNavbarDesktop } from "./AppNavbarDesktop";
import AppLogo from "../AppLogo";
import { isAdmin } from "@/types/auth";

export function AppNavbar({ isShowSidebar = false }: { isShowSidebar?: boolean }) {
  const { t, i18n } = useAppTranslation();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage: setStoreLanguage } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [confirmationModal, setConfirmationModal] = useState<ModalProps | null>(null);
  const logOffMutation = useLogoutMutation();

  // Sync language from store to i18n on mount and when store changes
  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Sync theme changes to store
  useEffect(() => {
    const storeTheme = useAuthStore.getState().theme;
    if (theme && theme !== storeTheme) {
      useAuthStore.getState().setTheme(theme);
    }
  }, [theme]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setStoreLanguage(lng);
  };

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme as "light" | "dark" | "system");
    useAuthStore.getState().setTheme(newTheme);
  };

  const onLogoutClick = () => {
    setConfirmationModal({
      title: t(($) => $.labels.logOutTitle),
      desc: t(($) => $.labels.logOutDesc),
      textConfirm: t(($) => $.labels.logout),
      textCancel: t(($) => $.labels.cancel),
      iconType: "question",
      onConfirmClick: () => {
        logOffMutation.mutate(undefined, {
          onSuccess: () => {
            setConfirmationModal(null);
          },
          onError: () => {
            setConfirmationModal(null);
          },
        });
      },
      onCancelClick: () => setConfirmationModal(null),
    });
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
    switch (language) {
      case "id":
        return "🇮🇩";
      case "en":
        return "🇬🇧";
      default:
        return "🇮🇩";
    }
  };

  return (
    <header className="sticky top-0 z-50 px-4 py-1 bg-card/70 flex h-12 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-10 backdrop-blur-xl ">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-row gap-4 items-center">
          {isShowSidebar ? (
            <>
              <SidebarTrigger variant={"outline"} onClick={() => {}} />
              <Separator orientation={"vertical"} className={"h-6"} style={{ height: "20px" }} />
            </>
          ) : (
            <AppLogo disableColapsed={isAdmin(user) && isShowSidebar} />
          )}
        </div>

        {/* Desktop Navigation */}
        <AppNavbarDesktop />

        {/* Right Side - Settings, Login/Avatar */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-xl">
                {getLanguageFlag()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t(($) => $.labels.language)}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => changeLanguage("id")}
                className={cn(
                  "my-1",
                  language === "id"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90"
                    : "hover:bg-accent focus:bg-accent",
                )}
              >
                <span className="mr-2">🇮🇩</span>
                Indonesia
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeLanguage("en")}
                className={cn(
                  "my-1",
                  language === "en"
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90"
                    : "hover:bg-accent focus:bg-accent",
                )}
              >
                <span className="mr-2">🇬🇧</span>
                English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                {getThemeIcon()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                  className={cn("mr-2 h-4 w-4", theme === "light" ? "text-primary-foreground" : "")}
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
                  className={cn("mr-2 h-4 w-4", theme === "dark" ? "text-primary-foreground" : "")}
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
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User dropdown or login button */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.user?.image || ""}
                      alt={user?.user?.name || "User"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs uppercase">
                      {user?.user?.name?.substring(0, 2)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={user?.user?.image || ""}
                        alt={user?.user?.name?.substring(0, 2)?.toUpperCase() || "U"}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm uppercase">
                        {user?.user?.name?.substring(0, 2)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={AppRoute.user.profile.url}>
                    <User className="mr-2 h-4 w-4" />
                    {t(($) => $.labels.profile)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogoutClick}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t(($) => $.labels.logout)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm" className="px-3">
              <Link to={AppRoute.auth.signIn.url}>{t(($) => $.labels.login)}</Link>
            </Button>
          )}

          <AppNavbarMobile isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </div>
      {confirmationModal && <DialogModal modal={confirmationModal} variantSubmit="destructive" />}
    </header>
  );
}
