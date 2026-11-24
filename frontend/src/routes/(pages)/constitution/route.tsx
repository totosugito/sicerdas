import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ConstitutionNav } from "@/features/constitution";

export const Route = createFileRoute("/(pages)/constitution")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="page-container">
      <ConstitutionNav />
      <Outlet />
    </div>
  );
}
