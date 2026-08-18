import * as React from 'react'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import type { AuthContext } from '@/types/auth'

interface MyRouterContext {
  auth: AuthContext
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})
