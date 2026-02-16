import { NotFoundError } from '@/components/custom/errors';
import { useAuth } from '@/hooks/use-auth';
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { EnumUserRole } from 'backend/src/db/schema/enum-auth';

export const Route = createFileRoute('/(pages)/(tier-pricing)')({
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

