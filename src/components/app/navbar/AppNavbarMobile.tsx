import { Link, useLocation } from '@tanstack/react-router'
import { useAppTranslation } from '@/lib/i18n-typed'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import {
    BookOpen,
    Menu,
    FlaskConical,
    Trophy,
    Shield,
    LucideIcon,
    ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useAuth } from '@/hooks/use-auth'
import { AppRoute } from '@/constants/app-route'
import { APP_CONFIG } from '@/constants/config'
import { useAppMenu, MenuItem } from '@/components/app/hooks/use-app-menu'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import AppLogo from '@/components/app/AppLogo'

interface AppNavbarMobileProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

export function AppNavbarMobile({ isOpen, setIsOpen }: AppNavbarMobileProps) {
    const { t } = useAppTranslation()
    const { isAuthenticated } = useAuth()
    const { booksMenu, constitutionMenu, tablePeriodicMenu, quizMenu } =
        useAppMenu()

    const menuGroups = [
        {
            id: 'books',
            title: t($ => $.landing.navbar.books.title),
            Icon: BookOpen,
            items: booksMenu,
        },
        {
            id: 'constitution',
            title: t($ => $.landing.navbar.constitution.title),
            Icon: Shield,
            items: constitutionMenu,
        },
        {
            id: 'periodicTable',
            title: t($ => $.landing.navbar.periodicTable.title),
            Icon: FlaskConical,
            items: tablePeriodicMenu,
        },
        // {
        //     id: 'quiz',
        //     title: t($ => $.landing.navbar.quiz.title),
        //     Icon: Trophy,
        //     items: quizMenu,
        // },
    ]

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <Menu className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </Button>
              }
              className="lg:hidden"
            />
            <SheetContent
                side="right"
                className="gap-0 w-[300px] sm:w-[350px] p-0 flex flex-col bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-white/10"
                aria-describedby={undefined}
            >
                <VisuallyHidden.Root>
                    <SheetTitle>{t($ => $.app.appName)}</SheetTitle>
                </VisuallyHidden.Root>

                {/* Header */}
                <SheetHeader className="px-6 py-8 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
                    <AppLogo disableCollapsed onClick={() => setIsOpen(false)} />
                </SheetHeader>

                {/* Scrollable Nav Area */}
                <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                    <div className="flex flex-col gap-1.5">
                        {menuGroups.map((group) => (
                            <MobileNavGroup
                                key={group.id}
                                id={group.id}
                                title={group.title}
                                Icon={group.Icon}
                                items={group.items}
                                onLinkClick={() => setIsOpen(false)}
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-6 py-1 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30">
                    {!isAuthenticated ? (
                        <Link
                            to={AppRoute.auth.signIn.url}
                            onClick={() => setIsOpen(false)}
                        >
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-md transition-all h-11 font-bold text-sm">
                                {t($ => $.labels.login)}
                            </Button>
                        </Link>
                    ) : (
                        <div className="text-center py-2">
                            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                                {t($ => $.app.appName)} v{APP_CONFIG.app.version || '1.0'}
                            </p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}

interface MobileNavGroupProps {
    id: string
    title: string
    Icon: LucideIcon
    items: MenuItem[]
    onLinkClick: () => void
}

function MobileNavGroup({
    id,
    title,
    Icon,
    items,
    onLinkClick,
}: MobileNavGroupProps) {
    const { mobileMenu, setMobileMenuExpanded } = useAppStore()
    // Default to false if not present in the store for a more compact initial view
    const isOpen = mobileMenu[id] ?? false
    const location = useLocation()

    const handleOpenChange = (open: boolean) => {
        setMobileMenuExpanded(id, open)
    }

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={handleOpenChange}
            className="w-full"
        >
            <CollapsibleTrigger
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl w-full cursor-pointer transition-all duration-200",
                    isOpen
                        ? "bg-slate-100/80 dark:bg-slate-800/80"
                        : "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900"
                )}
            >
                <div
                    className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        isOpen
                            ? "bg-white dark:bg-slate-700 text-primary shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                    )}
                >
                    <Icon className="w-4 h-4" />
                </div>
                <h3 className={cn(
                    "font-bold text-[13px] tracking-wide flex-1 text-left transition-colors",
                    isOpen ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                )}>
                    {title}
                </h3>
                <ChevronRight
                    className={cn(
                        'h-4 w-4 transition-transform duration-300 text-slate-400',
                        isOpen && 'rotate-90 text-primary',
                    )}
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-0.5 mt-1 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden px-1">
                {items.map((item: MenuItem) => {
                    const isActive = location.pathname === item.to &&
                        JSON.stringify(location.search) === JSON.stringify(item.search || {})

                    return (
                        <Link
                            key={item.title}
                            to={item.to}
                            search={item.search}
                            params={item.params}
                            onClick={onLinkClick}
                            className={cn(
                                "block px-10 py-2.5 text-sm rounded-lg transition-all duration-200 font-medium relative",
                                isActive
                                    ? "text-primary bg-primary/5"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-primary" />
                            )}
                            {item.title}
                        </Link>
                    )
                })}
            </CollapsibleContent>
        </Collapsible>
    )
}
