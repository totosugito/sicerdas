import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(pages)/(exam)/(passages)/admin/edit-passage/$id',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(pages)/(exam)/(passages)/admin/edit-passage/$id"!</div>
}
