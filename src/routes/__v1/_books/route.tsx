import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/__v1/_books')({
    component: RouteComponent,
  })
  
  function RouteComponent() {
    return <Outlet/>
  }
