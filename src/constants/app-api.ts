const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL
const APP_URL_API = APP_BASE_URL + "/api"
const APP_URL_V1 = APP_URL_API + "/v1"
export const AppApi = {
  auth: {
    signIn: APP_URL_API + "/auth/sign-in-email",
    signUp: APP_URL_API + "/auth/sign-up/email",
    logout: APP_URL_API + "/user/logout",
    forgotPassword: APP_URL_API + "/auth/auth-request-password-reset",
    resetPassword: APP_URL_API + "/auth/auth-reset-password",
    checkResetToken: APP_URL_API + "/auth/check-token-reset",
    emailOtpForgetPassword: APP_URL_API + "/auth/email-otp-forget-password",
    emailOtpVerifyForgetPassword: APP_URL_API + "/auth/email-otp-verify-forget-password",
    emailOtpResetPassword: APP_URL_API + "/auth/email-otp-reset-password",
    getSession: APP_URL_API + "/auth/get-session",
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
  user: {
    details: APP_URL_API + "/user/details",
    update: APP_URL_API + "/user/update",
    changePassword: APP_URL_API + "/user/change-password",
    avatar: APP_URL_API + "/user/avatar",
    sessions: APP_URL_API + "/user/sessions",
    revokeSession: APP_URL_API + "/user/multi-session/revoke",
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
  },
  periodicTable: {
    element: APP_URL_V1 + "/periodic-table/element",
  }
}