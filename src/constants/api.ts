const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL
const APP_URL_API = APP_BASE_URL + "/api"
const APP_URL_V1 = APP_URL_API + "/v1"
export const AppApi = {
  auth: {
    login: APP_URL_API + "/auth/sign-in-email",
    logout: APP_URL_V1 + "/user/logout",
  },
  admin: {
    user: {
      list: APP_URL_API + "/admin/user/list",
      delete: APP_URL_API + "/admin/user/delete",
      create: APP_URL_API + "/admin/user/create",
      changePassword: APP_URL_API + "/admin/user/:id/reset-password",
      crud: APP_URL_API + "/admin/user/:id",
      avatar: APP_URL_API + "/admin/user/:id/avatar",
      deletes: APP_URL_API + "/admin/user/deletes",
      ban: APP_URL_API + "/admin/user/:id/ban",
    }
  },
  project: {
    list: APP_URL_V1 + "/project/list",
    ganttView: APP_URL_V1 + "/project/gantt-view",
    create: APP_URL_V1 + "/project/create",
    crud: APP_URL_V1 + "/project",
  },
  book: {
    list: APP_URL_V1 + "/book/list",
    create: APP_URL_V1 + "/book/create",
    crud: APP_URL_V1 + "/book",
  }
}

export const AppRoute = {
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