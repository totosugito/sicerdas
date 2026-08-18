import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(pages)/(education)')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
