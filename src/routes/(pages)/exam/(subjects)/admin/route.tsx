import { NotFoundError } from "@/components/custom/errors";
import { useAuth } from "@/hooks/use-auth";
import { isAdmin } from "@/types/auth";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(pages)/exam/(subjects)/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();

  if (!isAdmin(auth?.user)) {
    return <NotFoundError />;
  }

  return (
    <div className="page-full">
      <Outlet />
    </div>
  );
}
