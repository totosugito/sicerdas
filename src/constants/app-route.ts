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
  book: {
    detail: { url: "/book/$id" },
    books: { url: "/books" },
  },
  periodicTable: {
    periodicTable: { url: "/periodic-table" },
    elementDetail: { url: "/periodic/element/$id" },
    elementIsotope: { url: "/periodic/isotope/$id" },
    elementComparison: { url: "/periodic/element-comparison" },
    chemistryDictionary: { url: "/periodic/chemistry-dictionary" },
  },
  constitution: {
    pancasila: { url: "/constitution/pancasila" },
    pembukaanUud1945: { url: "/constitution/pembukaan-uud-1945" },
    butirPancasila: { url: "/constitution/butir-pancasila" },
    uud1945: { url: "/constitution/pasal-uud-1945" },
    uud1945Asli: { url: "/constitution/pasal-uud-1945-asli" },
    amandemen: { url: "/constitution/pasal-uud-1945-amandemen" },
  },
  quiz: {
    quiz: { url: "/quiz" },
    detail: { url: "/quiz/$id" },
  },
  web: {
    about: { url: "/about" },
    faq: { url: "/faq" },
    privacy: { url: "/privacy" },
    support: { url: "/support" },
    terms: { url: "/terms" },
  },
  admin: {
    dashboard: { url: "/admin/dashboard" },
    chatAi: {
      models: { url: "/admin/chat-ai/models" },
    },
    user: {
      list: { url: "/admin/users" },
    }
  }
}