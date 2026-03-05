import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(pages)/(exam)/(packages)/admin/detail-package/$id',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(pages)/(exam)/(packages)/admin/detail-package/$id"!</div>
}
