import { NotFoundError } from "@/components/custom/errors";
import { useAuth } from "@/hooks/use-auth";
import { getUserStore } from "@/types/auth";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(pages)/users/user")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();

  if (!getUserStore(auth?.user)) {
    return <NotFoundError />;
  }

  return (
    <div className="page-container">
      <Outlet />
    </div>
  );
}
