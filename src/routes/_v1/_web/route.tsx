import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_v1/_web')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
    <div className='w-full py-6'>
        <Outlet />
    </div>)
}
