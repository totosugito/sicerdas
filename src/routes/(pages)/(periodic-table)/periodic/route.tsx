import { cn } from '@/lib/utils'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(pages)/(periodic-table)/periodic')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className={cn('page-container-no-top')}>
            <Outlet />
        </div>)
}
