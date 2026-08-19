import { Link, useLocation } from '@tanstack/react-router'
import { useAppTranslation } from '@/lib/i18n-typed'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import {
    Book,
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
import { useAppMenu, MenuItem } from '@/features/app/hooks/use-app-menu'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/useAppStore'
import AppLogo from '@/features/app/AppLogo'

interface AppNavbarMobileProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

export function AppNavbarMobile({ isOpen, setIsOpen }: AppNavbarMobileProps) {
    const { t } = useAppTranslation()
    const { isAuthenticated } = useAuth()
    const { booksMenu, constitutionMenu, tablePeriodicMenu } = useAppMenu()

    const menuGroups = [
        {
            id: 'books',
            title: t($ => $.landing.navbar.books.title),
            Icon: Book,
            items: booksMenu,
            colorClass: 'text-primary bg-primary/10',
        },
        {
            id: 'constitution',
            title: t($ => $.landing.navbar.constitution.title),
            Icon: Shield,
            items: constitutionMenu,
            colorClass: 'text-indigo-500 bg-indigo-500/10',
        },
        {
            id: 'periodicTable',
            title: t($ => $.landing.navbar.periodicTable.title),
            Icon: FlaskConical,
            items: tablePeriodicMenu,
            colorClass: 'text-emerald-500 bg-emerald-500/10',
        },
    ]

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-xl hover:bg-accent/60 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5 text-foreground" />
                </Button>
              }
              className="lg:hidden"
            />
            <SheetContent
                side="right"
                className="gap-0 w-[300px] sm:w-[350px] p-0 flex flex-col bg-card/95 backdrop-blur-2xl border-l border-border/60 shadow-2xl"
                aria-describedby={undefined}
            >
                <VisuallyHidden>
                    <SheetTitle>{t($ => $.app.appName)}</SheetTitle>
                </VisuallyHidden>

                {/* Header */}
                <SheetHeader className="px-5 py-6 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border-b border-border/40">
                    <AppLogo size={36} textSize="lg" onClick={() => setIsOpen(false)} />
                </SheetHeader>

                {/* Scrollable Nav Area */}
                <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-2">
                    {menuGroups.map((group) => (
                        <MobileNavGroup
                            key={group.id}
                            id={group.id}
                            title={group.title}
                            Icon={group.Icon}
                            colorClass={group.colorClass}
                            items={group.items}
                            onLinkClick={() => setIsOpen(false)}
                        />
                    ))}
                </div>

                {/* Bottom Actions */}
                <div className="p-4 border-t border-border/40 bg-card/60 backdrop-blur-sm">
                    {!isAuthenticated ? (
                        <Link
                            to={AppRoute.auth.signIn.url}
                            onClick={() => setIsOpen(false)}
                        >
                            <Button className="w-full h-10 rounded-xl font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all text-xs sm:text-sm">
                                {t($ => $.labels.login)}
                            </Button>
                        </Link>
                    ) : (
                        <div className="text-center py-1">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
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
    colorClass: string
    items: MenuItem[]
    onLinkClick: () => void
}

function MobileNavGroup({
    id,
    title,
    Icon,
    colorClass,
    items,
    onLinkClick,
}: MobileNavGroupProps) {
    const { mobileMenu, setMobileMenuExpanded } = useAppStore()
    const isOpen = mobileMenu[id] ?? false
    const location = useLocation()

    const handleOpenChange = (open: boolean) => {
        setMobileMenuExpanded(id, open)
    }

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={handleOpenChange}
            className="w-full rounded-2xl border border-border/40 bg-card/40 overflow-hidden transition-colors"
        >
            <CollapsibleTrigger
                className={cn(
                    "flex items-center gap-3 px-3 py-2.5 w-full cursor-pointer transition-all duration-200",
                    isOpen ? "bg-accent/40" : "hover:bg-accent/20"
                )}
            >
                <div
                    className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                        colorClass
                    )}
                >
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <h3 className={cn(
                    "font-bold text-xs tracking-wide flex-1 text-left transition-colors",
                    isOpen ? "text-foreground" : "text-foreground/80"
                )}>
                    {title}
                </h3>
                <ChevronRight
                    className={cn(
                        'h-4 w-4 transition-transform duration-200 text-muted-foreground',
                        isOpen && 'rotate-90 text-primary',
                    )}
                />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 p-1.5 pt-0 overflow-hidden">
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
                                "block px-3 py-2 text-xs rounded-xl transition-all duration-200 font-medium",
                                isActive
                                    ? "text-primary bg-primary/10 font-bold shadow-2xs"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <span>{item.title}</span>
                                {isActive && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                )}
                            </div>
                        </Link>
                    )
                })}
            </CollapsibleContent>
        </Collapsible>
    )
}

