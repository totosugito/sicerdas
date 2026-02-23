import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(pages)/exam/categories')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
