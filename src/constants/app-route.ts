

export const AppRoute = {
  auth: {
    signUp: {
      url: "/sign-up",
      breadcrumb: []
    },
    signIn: {
      url: "/sign-in",
      breadcrumb: []
    },
    forgotPassword: {
      url: "/forgot-password",
      breadcrumb: []
    },
    resetPassword: {
      url: "/reset-password",
      breadcrumb: []
    },
  },
  dashboard: {
    dashboard: "/",
  },
  project: {
    list: "/project/list",
    detail: "/project/$id",
  },
  admin: {
    user: {
      list: "/admin/users",
    }
  },
}