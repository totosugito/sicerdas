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