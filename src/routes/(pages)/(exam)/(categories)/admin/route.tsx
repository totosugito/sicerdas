import { NotFoundError } from '@/components/custom/errors';
import { useAuth } from '@/hooks/use-auth';
import { isAdmin } from '@/types/auth';
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(pages)/(exam)/(categories)/admin')({
    component: RouteComponent,
})

function RouteComponent() {
    const auth = useAuth();
    const user = auth?.user;

    if (!isAdmin(user)) {
        return <NotFoundError />
    }

    return (
        <div className="page-container">
            <Outlet />
        </div>
    )
}

