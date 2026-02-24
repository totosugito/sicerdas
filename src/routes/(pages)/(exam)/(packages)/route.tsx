import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(pages)/(exam)/(packages)')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(pages)/(exam)/(packages)"!</div>
}
