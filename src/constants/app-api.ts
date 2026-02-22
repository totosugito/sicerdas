const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL
const APP_URL_API = APP_BASE_URL + "/api"
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
    emailHasOtp: APP_URL_API + "/auth/email-has-otp",
    getSession: APP_URL_API + "/auth/get-session",
  },
  appTier: {
    admin: {
      create: APP_URL_API + "/app-tier/admin/create-tier",
      list: APP_URL_API + "/app-tier/admin/list-tier",
      crud: APP_URL_API + "/app-tier/admin",
    },
    list: APP_URL_API + "/app-tier",
  },
  user: {
    admin: {
      list: APP_URL_API + "/admin/user/list",
      delete: APP_URL_API + "/admin/user/delete",
      create: APP_URL_API + "/admin/user/create",
      changePassword: APP_URL_API + "/admin/user/:id/reset-password",
      crud: APP_URL_API + "/admin/user/:id",
      avatar: APP_URL_API + "/admin/user/:id/avatar",
      deletes: APP_URL_API + "/admin/user/deletes",
      ban: APP_URL_API + "/admin/user/:id/ban",
    },
    details: APP_URL_API + "/user/details",
    update: APP_URL_API + "/user/update",
    changePassword: APP_URL_API + "/user/change-password",
    avatar: APP_URL_API + "/user/avatar",
    sessions: APP_URL_API + "/user/sessions-list",
    revokeSession: APP_URL_API + "/user/multi-session-revoke",
    revokeOtherSessions: APP_URL_API + "/user/revoke-other-sessions-v1",
  },
  ai: {
    models: {
      list: APP_URL_API + "/admin/chat-ai/models/list",
      create: APP_URL_API + "/admin/chat-ai/models",
      crud: APP_URL_API + "/admin/chat-ai/models", // for GET, PATCH, DELETE single
      deleteBatch: APP_URL_API + "/admin/chat-ai/models/delete-batch",
      updateBatch: APP_URL_API + "/admin/chat-ai/models/update-batch",
    }
  },
  book: {
    list: APP_URL_API + "/book/list",
    detail: APP_URL_API + "/book/detail",
    create: APP_URL_API + "/book/create",
    crud: APP_URL_API + "/book",
    filterParams: APP_URL_API + "/book/filter-params",
    proxyPdf: APP_URL_API + "/book/proxy-pdf",
    bookmark: APP_URL_API + "/book/bookmark",
    updateDownload: APP_URL_API + "/book/update-download",
  },
  periodicTable: {
    element: APP_URL_API + "/periodic-table/element",
  },
  contentReport: {
    create: APP_URL_API + "/content-report/create",
  },
  exam: {
    categories: {
      admin: {
        list: APP_URL_API + "/exam/categories/admin/list",
        create: APP_URL_API + "/exam/categories/admin/create",
        update: APP_URL_API + "/exam/categories/admin/update/:id",
        delete: APP_URL_API + "/exam/categories/admin/delete/:id",
      }
    }
  }
}