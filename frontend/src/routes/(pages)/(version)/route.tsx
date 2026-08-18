import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(pages)/(version)")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
