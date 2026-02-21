import { NotFoundError } from '@/components/custom/errors';
import { useAuth } from '@/hooks/use-auth';
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { EnumUserRole } from 'backend/src/db/schema/user/types';

export const Route = createFileRoute('/(pages)/admin')({
    component: RouteComponent,
})

function RouteComponent() {
    const auth = useAuth();
    const userRole = auth?.user?.user?.role ?? "";

    if (userRole !== EnumUserRole.ADMIN) {
        return <NotFoundError />
    }

    return (<Outlet />)
}
