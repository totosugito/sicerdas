import { Link, useLocation } from '@tanstack/react-router'
import { useAppTranslation } from '@/lib/i18n-typed'
import {
    Book,
    FlaskConical,
    Shield,
    ChevronDown,
    Sparkles,
    FileText,
    GraduationCap,
    Atom,
} from 'lucide-react'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuPositioner,
    NavigationMenuPopup,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { useAppMenu, MenuItem } from '@/features/app/hooks/use-app-menu'

export function AppNavbarDesktop() {
    const { t } = useAppTranslation()
    const { booksMenu, constitutionMenu, tablePeriodicMenu } = useAppMenu()
    const location = useLocation()

    const isGroupActive = (items: MenuItem[]) => {
        return items.some(
            (item) =>
                location.pathname === item.to ||
                location.pathname.startsWith(item.to + '/')
        )
    }

    return (
        <div className="hidden lg:flex items-center gap-1">
            <NavigationMenu>
                <NavigationMenuList className="gap-1.5">
                    {/* Books Menu */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger
                            className={cn(
                                "text-xs font-semibold rounded-xl transition-all px-3 py-1.5 h-8.5 gap-2 group cursor-pointer",
                                isGroupActive(booksMenu)
                                    ? "bg-primary/10 text-primary font-bold shadow-xs"
                                    : "bg-transparent text-foreground/80 hover:text-foreground hover:bg-accent/60"
                            )}
                        >
                            <div className="w-5 h-5 rounded-md bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Book className="w-3.5 h-3.5" />
                            </div>
                            <span>{t($ => $.landing.navbar.books.title)}</span>
                        </NavigationMenuTrigger>
                        <NavigationMenuPositioner>
                            <NavigationMenuPopup>
                                <NavigationMenuContent className="p-0 bg-card/95 backdrop-blur-2xl border border-border/70 rounded-2xl shadow-xl overflow-hidden">
                                    <div className="p-3 bg-gradient-to-r from-primary/5 via-accent/10 to-transparent border-b border-border/40 flex items-center gap-2">
                                        <Book className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-bold text-foreground">
                                            {t($ => $.landing.navbar.books.title)}
                                        </span>
                                    </div>
                                    <ul className="grid w-[460px] gap-1.5 p-2.5 md:grid-cols-2">
                                        {booksMenu.map((item: MenuItem) => (
                                            <ListItem
                                                key={item.title}
                                                title={item.title}
                                                to={item.to}
                                                search={item.search}
                                            >
                                                {item.description}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuPopup>
                        </NavigationMenuPositioner>
                    </NavigationMenuItem>

                    {/* Constitution Menu */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger
                            className={cn(
                                "text-xs font-semibold rounded-xl transition-all px-3 py-1.5 h-8.5 gap-2 group cursor-pointer",
                                isGroupActive(constitutionMenu)
                                    ? "bg-indigo-500/10 text-indigo-500 font-bold shadow-xs"
                                    : "bg-transparent text-foreground/80 hover:text-foreground hover:bg-accent/60"
                            )}
                        >
                            <div className="w-5 h-5 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                                <Shield className="w-3.5 h-3.5" />
                            </div>
                            <span>{t($ => $.landing.navbar.constitution.title)}</span>
                        </NavigationMenuTrigger>
                        <NavigationMenuPositioner>
                            <NavigationMenuPopup>
                                <NavigationMenuContent className="p-0 bg-card/95 backdrop-blur-2xl border border-border/70 rounded-2xl shadow-xl overflow-hidden">
                                    <div className="p-3 bg-gradient-to-r from-indigo-500/5 via-accent/10 to-transparent border-b border-border/40 flex items-center gap-2">
                                        <Shield className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-xs font-bold text-foreground">
                                            {t($ => $.landing.navbar.constitution.title)}
                                        </span>
                                    </div>
                                    <ul className="grid w-[460px] gap-1.5 p-2.5 md:grid-cols-2">
                                        {constitutionMenu.map((item: MenuItem) => (
                                            <ListItem
                                                key={item.title}
                                                title={item.title}
                                                to={item.to}
                                            >
                                                {item.description}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuPopup>
                        </NavigationMenuPositioner>
                    </NavigationMenuItem>

                    {/* Periodic Table Menu */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger
                            className={cn(
                                "text-xs font-semibold rounded-xl transition-all px-3 py-1.5 h-8.5 gap-2 group cursor-pointer",
                                isGroupActive(tablePeriodicMenu)
                                    ? "bg-emerald-500/10 text-emerald-500 font-bold shadow-xs"
                                    : "bg-transparent text-foreground/80 hover:text-foreground hover:bg-accent/60"
                            )}
                        >
                            <div className="w-5 h-5 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                <FlaskConical className="w-3.5 h-3.5" />
                            </div>
                            <span>{t($ => $.landing.navbar.periodicTable.title)}</span>
                        </NavigationMenuTrigger>
                        <NavigationMenuPositioner>
                            <NavigationMenuPopup>
                                <NavigationMenuContent className="p-0 bg-card/95 backdrop-blur-2xl border border-border/70 rounded-2xl shadow-xl overflow-hidden">
                                    <div className="p-3 bg-gradient-to-r from-emerald-500/5 via-accent/10 to-transparent border-b border-border/40 flex items-center gap-2">
                                        <FlaskConical className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-xs font-bold text-foreground">
                                            {t($ => $.landing.navbar.periodicTable.title)}
                                        </span>
                                    </div>
                                    <ul className="grid w-[460px] gap-1.5 p-2.5 md:grid-cols-2">
                                        {tablePeriodicMenu.map((item: MenuItem) => (
                                            <ListItem
                                                key={item.title}
                                                title={item.title}
                                                to={item.to}
                                                params={item.params}
                                            >
                                                {item.description}
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuPopup>
                        </NavigationMenuPositioner>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </div>
    )
}

interface ListItemProps extends Omit<MenuItem, 'description'> {
    className?: string
    children: React.ReactNode
}

const ListItem = ({ className, title, children, to, params, search, ...props }: ListItemProps) => {
    const location = useLocation()
    const isActive =
        location.pathname === to &&
        JSON.stringify(location.search) === JSON.stringify(search || {})

    return (
        <li>
            <NavigationMenuLink
                render={
                    <Link
                        to={to}
                        params={params}
                        search={search}
                        className={cn(
                            "group block select-none rounded-xl p-2.5 leading-none no-underline outline-none transition-all duration-200 border",
                            isActive
                                ? "bg-primary/10 border-primary/25 shadow-xs"
                                : "bg-card/50 hover:bg-accent/70 hover:border-border/60 border-transparent hover:shadow-2xs",
                            className
                        )}
                        {...props}
                    />
                }
            >
                <div className="flex items-center justify-between gap-1">
                    <span className={cn(
                        "text-xs font-bold transition-colors leading-snug truncate",
                        isActive ? "text-primary font-extrabold" : "text-foreground group-hover:text-primary"
                    )}>
                        {title}
                    </span>
                    <ChevronDown className="w-3 h-3 -rotate-90 text-muted-foreground/40 opacity-0 group-hover:opacity-100 group-hover:text-primary transition-all flex-shrink-0 -translate-x-1 group-hover:translate-x-0" />
                </div>
                <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground group-hover:text-foreground/80 mt-1 font-normal">
                    {children}
                </p>
            </NavigationMenuLink>
        </li>
    )
}



