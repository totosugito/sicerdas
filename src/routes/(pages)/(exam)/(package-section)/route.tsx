import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(pages)/(exam)/(package-section)')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
