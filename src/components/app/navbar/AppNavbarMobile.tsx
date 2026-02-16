import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
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

interface AppNavbarMobileProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

export function AppNavbarMobile({ isOpen, setIsOpen }: AppNavbarMobileProps) {
    const { t } = useTranslation()
    const { isAuthenticated } = useAuth()
    const { booksMenu, constitutionMenu, tablePeriodicMenu, quizMenu } =
        useAppMenu()

    const menuGroups = [
        {
            id: 'books',
            title: t('landing.navbar.books.title'),
            Icon: BookOpen,
            items: booksMenu,
            variant: 'primary' as const,
        },
        {
            id: 'constitution',
            title: t('landing.navbar.constitution.title'),
            Icon: Shield,
            items: constitutionMenu,
            variant: 'secondary' as const,
        },
        {
            id: 'periodicTable',
            title: t('landing.navbar.periodicTable.title'),
            Icon: FlaskConical,
            items: tablePeriodicMenu,
            variant: 'primary' as const,
        },
        {
            id: 'quiz',
            title: t('landing.navbar.quiz.title'),
            Icon: Trophy,
            items: quizMenu,
            variant: 'secondary' as const,
        },
    ]

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent
                side="right"
                className="w-[320px] sm:w-[400px] p-0"
                aria-describedby={undefined}
            >
                {/* Header with gradient background */}
                <SheetHeader className="px-6 py-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-background border-b">
                    <SheetTitle className="flex items-center gap-3">
                        <img
                            src={APP_CONFIG.app.logo}
                            alt={APP_CONFIG.app.name}
                            className="h-12 w-12"
                        />
                        <span className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {t('app.appName')}
                        </span>
                    </SheetTitle>
                </SheetHeader>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="flex flex-col gap-4">
                        {menuGroups.map((group) => (
                            <MobileNavGroup
                                key={group.id}
                                id={group.id}
                                title={group.title}
                                Icon={group.Icon}
                                items={group.items}
                                variant={group.variant}
                                onLinkClick={() => setIsOpen(false)}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer with Login Button */}
                {!isAuthenticated && (
                    <div className="px-6 py-4 border-t bg-gradient-to-br from-background to-primary/5">
                        <Link
                            to={AppRoute.auth.signIn.url}
                            onClick={() => setIsOpen(false)}
                        >
                            <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 h-12 font-semibold">
                                {t('landing.navbar.login')}
                            </Button>
                        </Link>
                    </div>
                )}
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
    variant?: 'primary' | 'secondary'
}

function MobileNavGroup({
    id,
    title,
    Icon,
    items,
    onLinkClick,
    variant = 'primary',
}: MobileNavGroupProps) {
    const { mobileMenu, setMobileMenuExpanded } = useAppStore()
    // Default to true if not present in the store
    const isOpen = mobileMenu[id] ?? true

    const handleOpenChange = (open: boolean) => {
        setMobileMenuExpanded(id, open)
    }

    const bgClass = variant === 'primary' ? 'bg-primary/5' : 'bg-secondary/5'
    const iconBgClass =
        variant === 'primary' ? 'bg-primary/10' : 'bg-secondary/10'
    const iconColorClass =
        variant === 'primary' ? 'text-primary' : 'text-secondary'

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={handleOpenChange}
            className="space-y-0"
        >
            <CollapsibleTrigger asChild>
                <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bgClass} w-full cursor-pointer hover:opacity-80 transition-opacity`}
                >
                    <div
                        className={`w-8 h-8 rounded-lg ${iconBgClass} flex items-center justify-center`}
                    >
                        <Icon className={`w-4 h-4 ${iconColorClass}`} />
                    </div>
                    <h3 className="font-semibold text-sm uppercase tracking-wide flex-1 text-left">
                        {title}
                    </h3>
                    <ChevronRight
                        className={cn(
                            'h-4 w-4 transition-transform duration-200',
                            isOpen && 'rotate-90',
                        )}
                    />
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
                {items.map((item: MenuItem) => (
                    <Link
                        key={item.title}
                        to={item.to}
                        search={item.search}
                        params={item.params}
                        onClick={onLinkClick}
                        className="block px-4 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:translate-x-1"
                    >
                        {item.title}
                    </Link>
                ))}
            </CollapsibleContent>
        </Collapsible>
    )
}
