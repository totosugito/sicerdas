import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()
    const { booksMenu, constitutionMenu, tablePeriodicMenu, quizMenu } = useAppMenu()

    return (
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
                        <NavigationMenuTrigger className="text-base bg-transparent">
                            <Shield className="w-4 h-4 mr-2" />
                            {t('landing.navbar.constitution.title')}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
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
                        <NavigationMenuTrigger className="text-base bg-transparent">
                            <FlaskConical className="w-4 h-4 mr-2" />
                            {t('landing.navbar.periodicTable.title')}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
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
                        <NavigationMenuTrigger className="text-base bg-transparent">
                            <Trophy className="h-4 w-4 mr-2" />
                            {t('landing.navbar.quiz.title')}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                                {quizMenu.map((item: MenuItem) => (
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
