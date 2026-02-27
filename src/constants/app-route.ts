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
  appTier: {
    adminList: { url: "/admin/list-tier" },
    adminCreate: { url: "/admin/create-tier" },
    adminEdit: { url: "/admin/edit-tier/$slug" },
    publicList: { url: "/tier-pricing" },
  },
  book: {
    detail: { url: "/book/$id" },
    books: { url: "/books" },
  },
  educationGrade: {
    admin: {
      list: { url: "/admin/list-grade" },
      create: { url: "/admin/create-grade" },
      edit: { url: "/admin/edit-grade/$id" },
    }
  },
  exam: {
    categories: {
      admin: {
        list: { url: "/admin/list-category" },
      },
    },
    tags: {
      admin: {
        list: { url: "/admin/list-tag" },
      },
    },
    packages: {
      admin: {
        list: { url: "/admin/list-package" },
        create: { url: "/admin/create-package" },
        edit: { url: "/admin/edit-package/$id" },
      },
    }
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