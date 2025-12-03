import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_v1/periodic-table/route-tes')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="w-full h-screen">
    </div>
  )
}