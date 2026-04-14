import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(pages)/exam/(subjects)")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
