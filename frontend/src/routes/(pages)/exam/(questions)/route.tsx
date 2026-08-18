import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(pages)/exam/(questions)")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
