import { AppNavbar } from '@/components/app'
import { Footer } from '@/components/pages/landing'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_v1')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="flex flex-col min-h-screen w-full bg-background">
            <AppNavbar />
            <div className='flex flex-col flex-1 w-full items-center px-8 pt-18 pb-8 max-w-5xl mx-auto'>
                <Outlet />
            </div>
            <Footer />
        </div>);
}
