import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(pages)/(tier)")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
