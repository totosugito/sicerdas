import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_v1/constitution/uud-1945')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_v1/constitution/uud-1945"!</div>
}
