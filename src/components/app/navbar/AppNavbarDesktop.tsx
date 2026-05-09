import { Link } from '@tanstack/react-router'
import { useAppTranslation } from '@/lib/i18n-typed'
import {
    BookOpen,
    FlaskConical,
    Trophy,
    Shield,
} from 'lucide-react'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'
import { useAppMenu, MenuItem } from '@/components/app/hooks/use-app-menu'

export function AppNavbarDesktop() {
    const { t } = useAppTranslation()
    const { booksMenu, constitutionMenu, tablePeriodicMenu, quizMenu } = useAppMenu()

    return (
        <div className="hidden lg:flex items-center gap-1">
            <NavigationMenu>
                <NavigationMenuList className="gap-1">
                    {/* Books Menu */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="text-sm font-bold bg-transparent rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all px-3 py-1.5 h-9">
                            <BookOpen className="w-4 h-4 mr-2 text-slate-500" />
                            {t($ => $.landing.navbar.books.title)}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[500px] gap-1 p-3 md:grid-cols-2">
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
                    </NavigationMenuItem>

                    {/* Constitution Menu */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="text-sm font-bold bg-transparent rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all px-3 py-1.5 h-9">
                            <Shield className="w-4 h-4 mr-2 text-slate-500" />
                            {t($ => $.landing.navbar.constitution.title)}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[500px] gap-1 p-3 md:grid-cols-2">
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
                    </NavigationMenuItem>

                    {/* Periodic Table */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="text-sm font-bold bg-transparent rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all px-3 py-1.5 h-9">
                            <FlaskConical className="w-4 h-4 mr-2 text-slate-500" />
                            {t($ => $.landing.navbar.periodicTable.title)}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[500px] gap-1 p-3 md:grid-cols-2">
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
                    </NavigationMenuItem>

                    {/* Quiz Menu */}
                    <NavigationMenuItem>
                        <NavigationMenuTrigger className="text-sm font-bold bg-transparent rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all px-3 py-1.5 h-9">
                            <Trophy className="h-4 w-4 mr-2 text-slate-500" />
                            {t($ => $.landing.navbar.quiz.title)}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[500px] gap-1 p-3 md:grid-cols-2">
                                {quizMenu.map((item: MenuItem) => (
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
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    to={to}
                    params={params}
                    search={search}
                    className={cn(
                        "group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 focus:bg-slate-50 dark:focus:bg-slate-800/40",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors leading-none">
                        {title}
                    </div>
                    <p className="line-clamp-2 text-[12px] leading-snug text-slate-500 dark:text-slate-400 font-medium mt-1">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}
