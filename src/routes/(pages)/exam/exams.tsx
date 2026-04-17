import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(pages)/exam/exams")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(pages)/exam/exams"!</div>;
}
