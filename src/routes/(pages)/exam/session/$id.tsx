import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(pages)/exam/session/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Exam Session: {id}</h1>
        <p className="text-muted-foreground">Exam engine implementation coming soon...</p>
      </div>
    </div>
  );
}
