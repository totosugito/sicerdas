import { AppNavbar } from '@/components/app'
import { Footer } from '@/components/pages/landing'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp } from 'lucide-react'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/useAuthStore'
import { isShowSidebar } from '@/types/auth'
import AppSidebar from '@/components/app/sidebar/AppSidebar'
import { AdminNav } from '@/constants/admin-nav'
import { SidebarData } from '@/components/app/sidebar/types'

export const Route = createFileRoute('/(pages)')({
    component: RouteComponent,
})

function RouteComponent() {
    const [showGoToTop, setShowGoToTop] = useState(false)
    const { user, openSideMenu, setOpenSideMenu } = useAuthStore()

    useEffect(() => {
        const handleScroll = () => {
            // Show the button when scrolled more than 300px
            setShowGoToTop(window.scrollY > 300)
        }

        // Add scroll event listener
        window.addEventListener('scroll', handleScroll)

        // Clean up event listener on component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    let webNav: Record<string, any> = {};
    if (isShowSidebar(user)) {
        webNav = AdminNav;
    }

    return (
        <SidebarProvider open={openSideMenu} onOpenChange={setOpenSideMenu}>
            {isShowSidebar(user) && <AppSidebar navItems={webNav as SidebarData} />}
            <SidebarInset>
                <div className="flex flex-col min-h-screen w-full bg-background">
                    <AppNavbar isShowSidebar={isShowSidebar(user)} />
                    <>
                        <Outlet />
                    </>
                    <Footer />

                    {/* Go to Top Button */}
                    {showGoToTop && (
                        <Button
                            onClick={scrollToTop}
                            className="fixed bottom-8 right-8 z-50 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300"
                            size="icon"
                            aria-label="Go to top"
                        >
                            <ChevronUp className="h-6 w-6" />
                        </Button>
                    )}
                </div>
            </SidebarInset>
        </SidebarProvider >
    )
}