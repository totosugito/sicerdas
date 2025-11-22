import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/support')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_public/web-support"!</div>
}
