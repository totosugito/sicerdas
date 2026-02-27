import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(pages)/(education-grade)')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
