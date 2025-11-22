import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  GraduationCap,
  Menu,
  FlaskConical,
  Moon,
  Sun,
  Monitor,
  Trophy,
  Shield,
  User,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/theme-provider'
import { useAuthStore } from '@/stores/useAuthStore'
import { useAuth } from '@/hooks/use-auth'
import { AppRoute } from '@/constants/app-route'
import { useLogoutMutation } from "@/service/auth-api";
import { ModalProps, DialogModal } from "@/components/custom/components";
import { APP_CONFIG } from '@/constants/config'

export function AppNavbar() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage: setStoreLanguage } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuth();
  const [confirmationModal, setConfirmationModal] = useState<ModalProps | null>(null);
  const logOffMutation = useLogoutMutation();

  // Sync language from store to i18n on mount and when store changes
  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language)
    }
  }, [language, i18n])

  // Sync theme changes to store
  useEffect(() => {
    const storeTheme = useAuthStore.getState().theme
    if (theme && theme !== storeTheme) {
      useAuthStore.getState().setTheme(theme)
    }
  }, [theme])

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setStoreLanguage(lng)
  }

  const changeTheme = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'system')
    useAuthStore.getState().setTheme(newTheme)
  }

  const onLogoutClick = () => {
    setConfirmationModal({
      title: t("labels.logOutTitle"),
      desc: t("labels.logOutDesc"),
      textConfirm: t("labels.logout"),
      textCancel: t("labels.cancel"),
      iconType: "question",
      onConfirmClick: () => {
        logOffMutation.mutate(undefined, {
          onSuccess: () => {
            setConfirmationModal(null);
          },
          onError: () => {
            setConfirmationModal(null);
          }
        });
      },
      onCancelClick: () => setConfirmationModal(null),
    })
  }

  const booksMenu = [
    {
      title: t('landing.navbar.books.latestBooks'),
      href: `${AppRoute.books}/latest`,
      description: t('landing.navbar.books.descriptions.latestBooks')
    },
    {
      title: t('landing.navbar.books.curriculum2006'),
      href: `${AppRoute.books}/curriculum-2006`,
      description: t('landing.navbar.books.descriptions.curriculum2006')
    },
    {
      title: t('landing.navbar.books.curriculum2013'),
      href: `${AppRoute.books}/curriculum-2013`,
      description: t('landing.navbar.books.descriptions.curriculum2013')
    },
    {
      title: t('landing.navbar.books.curriculumMerdeka'),
      href: `${AppRoute.books}/curriculum-merdeka`,
      description: t('landing.navbar.books.descriptions.curriculumMerdeka')
    },
    {
      title: t('landing.navbar.books.educationBooks'),
      href: `${AppRoute.books}/education-books`,
      description: t('landing.navbar.books.descriptions.educationBooks')
    },
    {
      title: t('landing.navbar.books.translationBooks'),
      href: `${AppRoute.books}/translation-books`,
      description: t('landing.navbar.books.descriptions.translationBooks')
    },
    {
      title: t('landing.navbar.books.computerBooks'),
      href: `${AppRoute.books}/computer-books`,
      description: t('landing.navbar.books.descriptions.computerBooks')
    },
    {
      title: t('landing.navbar.books.literatureBooks'),
      href: `${AppRoute.books}/literature-books`,
      description: t('landing.navbar.books.descriptions.literatureBooks')
    },
  ]

  const pancasilaMenu = [
    {
      title: t('landing.navbar.pancasila.pancasila'),
      href: AppRoute.pancasila.pancasila.url,
      description: t('landing.navbar.pancasila.descriptions.pancasila')
    },
    {
      title: t('landing.navbar.pancasila.uud1945'),
      href: AppRoute.pancasila.uud1945.url,
      description: t('landing.navbar.pancasila.descriptions.uud1945')
    },
    {
      title: t('landing.navbar.pancasila.amandemen'),
      href: AppRoute.pancasila.amandemen.url,
      description: t('landing.navbar.pancasila.descriptions.amandemen')
    },
  ]

  const quizMenu = [
    {
      title: t('landing.navbar.quiz.semester'),
      href: '/quiz/semester',
      description: t('landing.navbar.quiz.descriptions.semester')
    },
    {
      title: t('landing.navbar.quiz.subjects'),
      href: '/quiz/subjects',
      description: t('landing.navbar.quiz.descriptions.subjects')
    },
    {
      title: t('landing.navbar.quiz.national'),
      href: '/quiz/national',
      description: t('landing.navbar.quiz.descriptions.national')
    },
    {
      title: t('landing.navbar.quiz.utbk'),
      href: '/quiz/utbk',
      description: t('landing.navbar.quiz.descriptions.utbk')
    },
    {
      title: t('landing.navbar.quiz.cpns'),
      href: '/quiz/cpns',
      description: t('landing.navbar.quiz.descriptions.cpns')
    },
    {
      title: t('landing.navbar.quiz.umptn'),
      href: '/quiz/umptn',
      description: t('landing.navbar.quiz.descriptions.umptn')
    },
  ]

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const getLanguageFlag = () => {
    switch (language) {
      case 'id':
        return '🇮🇩'
      case 'en':
        return '🇬🇧'
      default:
        return '🇮🇩'
    }
  }

  return (
    <nav
      className="px-4 fixed top-0 left-0 right-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border/50 shadow-sm"
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={APP_CONFIG.app.logo} alt={APP_CONFIG.app.name} className="h-8 w-8" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('app.appName')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Books Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-base bg-transparent">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {t('landing.navbar.books.title')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                      {booksMenu.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Pancasila Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-base bg-transparent">
                    <Shield className="w-4 h-4 mr-2" />
                    {t('landing.navbar.pancasila.title')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {pancasilaMenu.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Periodic Table */}
                <NavigationMenuItem>
                  <NavigationMenuLink asChild className={cn(
                    "group inline-flex w-max items-center justify-center px-4 h-9 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                  )}>
                    <Link to="/periodic-table">
                      <FlaskConical className="w-4 h-4 mr-2" />
                      {t('landing.navbar.periodicTable')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Quiz Menu */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-base bg-transparent">
                    <Trophy className="h-4 w-4 mr-2" />
                    {t('landing.navbar.quiz.title')}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                      {quizMenu.map((item) => (
                        <ListItem
                          key={item.title}
                          title={item.title}
                          href={item.href}
                        >
                          {item.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

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
                <DropdownMenuLabel>{t('labels.language')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => changeLanguage('id')}
                  className={cn('my-1', language === 'id' ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90' : 'hover:bg-accent focus:bg-accent')}
                >
                  <span className="mr-2">🇮🇩</span>
                  Indonesia
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeLanguage('en')}
                  className={cn('my-1', language === 'en' ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90' : 'hover:bg-accent focus:bg-accent')}
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
                <DropdownMenuLabel>{t('labels.theme')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => changeTheme('light')}
                  className={cn('my-1', theme === 'light' ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90' : 'hover:bg-accent focus:bg-accent')}
                >
                  <Sun className={cn("mr-2 h-4 w-4", theme === 'light' ? 'text-primary-foreground' : '')} />
                  {t('landing.navbar.theme.light')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeTheme('dark')}
                  className={cn('my-1', theme === 'dark' ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90' : 'hover:bg-accent focus:bg-accent')}
                >
                  <Moon className={cn("mr-2 h-4 w-4", theme === 'dark' ? 'text-primary-foreground' : '')} />
                  {t('landing.navbar.theme.dark')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeTheme('system')}
                  className={cn('my-1', theme === 'system' ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:bg-primary/90' : 'hover:bg-accent focus:bg-accent')}
                >
                  <Monitor className="mr-2 h-4 w-4 text-foreground" />
                  {t('landing.navbar.theme.system')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User dropdown or login button */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                    {user?.user?.image ? (
                      <img
                        src={user.user.image}
                        alt={user.user.name || "User"}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {user?.user?.name?.substring(0, 2)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-3">
                      {user?.user?.image ? (
                        <img
                          src={user.user.image}
                          alt={user.user.name || "User"}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                          {user?.user?.name?.substring(0, 2)?.toUpperCase() || "U"}
                        </div>
                      )}
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.user?.name || "User"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.user?.email || "user@example.com"}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={AppRoute.user.profile.url}>
                      <User className="mr-2 h-4 w-4" />
                      {t('landing.navbar.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogoutClick}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('landing.navbar.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="default" size="sm" className="h-9 px-3">
                <Link to={AppRoute.auth.signIn.url}>
                  {t('landing.navbar.login')}
                </Link>
              </Button>
            )}

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px] p-0">
                {/* Header with gradient background */}
                <SheetHeader className="px-6 py-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-background border-b">
                  <SheetTitle className="flex items-center gap-3">
                    <img src={APP_CONFIG.app.logo} alt={APP_CONFIG.app.name} className="h-12 w-12" />
                    <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {t('app.appName')}
                    </span>
                  </SheetTitle>
                </SheetHeader>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="flex flex-col gap-6">
                    {/* Books Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm uppercase tracking-wide">
                          {t('landing.navbar.books.title')}
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {booksMenu.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-2.5 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:translate-x-1"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Pancasila Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-secondary/5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-secondary" />
                        </div>
                        <h3 className="font-semibold text-sm uppercase tracking-wide">
                          {t('landing.navbar.pancasila.title')}
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {pancasilaMenu.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-2.5 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:translate-x-1"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Periodic Table */}
                    <div className="space-y-3">
                      <Link
                        to="/periodic-table"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg hover:bg-primary/10 transition-all duration-200 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <FlaskConical className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm uppercase tracking-wide">
                          {t('landing.navbar.periodicTable')}
                        </h3>
                      </Link>
                    </div>

                    {/* Quiz Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-secondary/5 rounded-lg">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-secondary" />
                        </div>
                        <h3 className="font-semibold text-sm uppercase tracking-wide">
                          {t('landing.navbar.quiz.title')}
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {quizMenu.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href}
                            onClick={() => setIsOpen(false)}
                            className="block px-4 py-2.5 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:translate-x-1"
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Login Button */}
                {!isAuthenticated &&
                  (
                    <div className="px-6 py-4 border-t bg-gradient-to-br from-background to-primary/5">
                      <Link to={AppRoute.auth.signIn.url} onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 h-12 font-semibold">
                          {t('landing.navbar.login')}
                        </Button>
                      </Link>
                    </div>
                  )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      {confirmationModal && <DialogModal modal={confirmationModal} />}
    </nav>
  )
}

const ListItem = ({ className, title, children, href, ...props }: any) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}