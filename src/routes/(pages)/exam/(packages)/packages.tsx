import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(pages)/exam/(packages)/packages")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(pages)/(exam)/(packages)/list-package"!</div>;
}
