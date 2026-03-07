import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(pages)/(exam)/(passages)/admin/create-passage',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(pages)/(exam)/(passages)/admin/create-passage"!</div>
}
