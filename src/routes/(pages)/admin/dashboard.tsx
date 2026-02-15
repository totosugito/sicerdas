import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(pages)/admin/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(pages)/admin/dashboard"!</div>
}
