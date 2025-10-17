import {createFileRoute, redirect} from '@tanstack/react-router'
import {APP_CONFIG} from "@/constants/config";

export const Route = createFileRoute('/')({
  // loader: ({ context }) => {
  //   return redirect({ to: context.auth.isAuthenticated ? APP_CONFIG.path.defaultPrivate : APP_CONFIG.path.defaultPublic })
  // },
  component: RouteComponent,
})

function RouteComponent() {
  return(
    <div>Welcome to T3</div>
  )
}