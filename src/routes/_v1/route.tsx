import { AppNavbar } from '@/components/app'
import { Footer } from '@/components/pages/landing'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronUp } from 'lucide-react'

export const Route = createFileRoute('/_v1')({
    component: RouteComponent,
})

function RouteComponent() {
    const [showGoToTop, setShowGoToTop] = useState(false)

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

    return (
        <div className="flex flex-col min-h-screen w-full bg-background">
            <AppNavbar />
            <div className='flex flex-col flex-1 w-full items-center px-8 pt-12 pb-8 max-w-5xl mx-auto'>
                <Outlet />
            </div>
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
    )
}