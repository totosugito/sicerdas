import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(pages)/(web)')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className='page-container'>
            <div className='w-full py-6'>
                <Outlet />
            </div>
        </div>)
}
