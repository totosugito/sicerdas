import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_v1/periodic-table')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_v1/periodic-table"!</div>
}
