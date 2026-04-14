import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(pages)/exam/(passages)")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
