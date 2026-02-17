import { NotFoundError } from '@/components/custom/errors';
import { useAuth } from '@/hooks/use-auth';
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(pages)/user')({
    component: RouteComponent,
})

function RouteComponent() {
    const auth = useAuth();
    const user = auth?.user?.user;

    if (!user) {
        return <NotFoundError />
    }

    return (
        <div className="page-container">
            <Outlet />
        </div>
    )
}

