import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(pages)/(exam)/(questions)/admin/json-questions")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(pages)/(exam)/(questions)/admin/json-questions"!</div>;
}
