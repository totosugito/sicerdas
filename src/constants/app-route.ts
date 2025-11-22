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
    resetPassword: {
      url: "/reset-password",
      breadcrumb: []
    },
    resetPasswordEmail: {
      url: "/reset-password-email",
      breadcrumb: []
    },
    otpForgetPassword: {
      url: "/otp-forget-password",
      breadcrumb: []
    },
    otpVerification: {
      url: "/otp-verification",
      breadcrumb: []
    },
    otpResetPassword: {
      url: "/otp-reset-password",
      breadcrumb: []
    },
  },
  user: {
    profile: { url: "/user/profile" },
  },
  dashboard: {
    dashboard: "/",
  },
  books: {
    list: { url: "/books" },
    detail: { url: "/books/$id" },
    latest: { url: "/books/latest" },
  },
  periodicTable: {
    periodicTable: { url: "/periodic-table" },
    element: { url: "/periodic-table/element" },
  },
  pancasila: {
    pancasila: { url: "/pancasila" },
    uud1945: { url: "/pancasila/uud1945" },
    amandemen: { url: "/pancasila/amandemen" },
  },
  quiz: {
    quiz: { url: "/quiz" },
    detail: { url: "/quiz/$id" },
  },
  public: {
    about: { url: "/about" },
    faq: { url: "/faq" },
    privacy: { url: "/privacy" },
    support: { url: "/support" },
    terms: { url: "/terms" },
  },
  admin: {
    user: {
      list: "/admin/users",
    }
  },
}