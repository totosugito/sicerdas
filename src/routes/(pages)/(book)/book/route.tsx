import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(pages)/(book)/book')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className='page-container'>
            <Outlet />
        </div>)
}
