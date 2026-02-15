import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
    BookOpen,
    Menu,
    FlaskConical,
    Trophy,
    Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'
import { AppRoute } from '@/constants/app-route'
import { APP_CONFIG } from '@/constants/config'
import { useAppMenu, MenuItem } from '@/components/app/hooks/use-app-menu'

interface AppNavbarMobileProps {
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

export function AppNavbarMobile({ isOpen, setIsOpen }: AppNavbarMobileProps) {
    const { t } = useTranslation()
    const { isAuthenticated } = useAuth()
    const { booksMenu, constitutionMenu, tablePeriodicMenu, quizMenu } = useAppMenu()

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px] sm:w-[400px] p-0" aria-describedby={undefined}>
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
                                {booksMenu.map((item: MenuItem) => (
                                    <Link
                                        key={item.title}
                                        to={item.to}
                                        search={item.search}
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-2.5 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:translate-x-1"
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Constitution Section */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/5 rounded-lg">
                                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-secondary" />
                                </div>
                                <h3 className="font-semibold text-sm uppercase tracking-wide">
                                    {t('landing.navbar.constitution.title')}
                                </h3>
                            </div>
                            <div className="space-y-1">
                                {constitutionMenu.map((item: MenuItem) => (
                                    <Link
                                        key={item.title}
                                        to={item.to}
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
                            <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <FlaskConical className="w-4 h-4 text-primary" />
                                </div>
                                <h3 className="font-semibold text-sm uppercase tracking-wide">
                                    {t('landing.navbar.periodicTable.title')}
                                </h3>
                            </div>
                            <div className="space-y-1">
                                {tablePeriodicMenu.map((item: MenuItem) => (
                                    <Link
                                        key={item.title}
                                        to={item.to}
                                        params={item.params}
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-2.5 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200 hover:translate-x-1"
                                    >
                                        {item.title}
                                    </Link>
                                ))}
                            </div>
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
                                {quizMenu.map((item: MenuItem) => (
                                    <Link
                                        key={item.title}
                                        to={item.to}
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
    )
}
