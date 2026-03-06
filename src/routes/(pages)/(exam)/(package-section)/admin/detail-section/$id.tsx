import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/(pages)/(exam)/(package-section)/admin/detail-section/$id',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(pages)/(exam)/(package-section)/admin/section/$id"!</div>
}
