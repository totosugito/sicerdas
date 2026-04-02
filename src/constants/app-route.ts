export const AppRoute = {
  auth: {
    signUp: {
      url: "/sign-up",
      breadcrumb: [],
    },
    signIn: {
      url: "/sign-in",
      breadcrumb: [],
    },
    resetPassword: {
      url: "/reset-password",
      breadcrumb: [],
    },
    resetPasswordEmail: {
      url: "/reset-password-email",
      breadcrumb: [],
    },
    otpForgetPassword: {
      url: "/otp-forget-password",
      breadcrumb: [],
    },
    otpVerification: {
      url: "/otp-verification",
      breadcrumb: [],
    },
    otpResetPassword: {
      url: "/otp-reset-password",
      breadcrumb: [],
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
    },
  },
  exam: {
    questions: {
      admin: {
        list: { url: "/admin/list-question" },
        create: { url: "/admin/create-question" },
        edit: { url: "/admin/edit-question/$id" },
        detail: { url: "/admin/detail-question/$id" },
        importJson: { url: "/admin/json-questions" },
      },
    },
    passages: {
      admin: {
        list: { url: "/admin/list-passage" },
        create: { url: "/admin/create-passage" },
        edit: { url: "/admin/edit-passage/$id" },
      },
    },
    subjects: {
      admin: {
        list: { url: "/admin/list-subject" },
        create: { url: "/admin/create-subject" },
        edit: { url: "/admin/edit-subject/$id" },
      },
    },
    packages: {
      admin: {
        list: { url: "/admin/list-package" },
        create: { url: "/admin/create-package" },
        edit: { url: "/admin/edit-package/$id" },
        detail: { url: "/admin/detail-package/$id" },
      },
    },
    packageSections: {
      admin: {
        list: { url: "/admin/list-section" },
        detail: { url: "/admin/detail-section/$id" },
        edit: { url: "/admin/edit-section/$id" },
        create: { url: "/admin/create-section" },
      },
    },
  },
  education: {
    categories: {
      admin: {
        list: { url: "/admin/categories" },
      },
    },
    grade: {
      admin: {
        list: { url: "/admin/grades" },
        create: { url: "/admin/create-grade" },
        edit: { url: "/admin/edit-grade/$id" },
      },
    },
    tags: {
      admin: {
        list: { url: "/admin/tags" },
      },
    },
  },
  admin: {
    dashboard: { url: "/admin/dashboard" },
    chatAi: {
      models: { url: "/admin/chat-ai/models" },
    },
    user: {
      list: { url: "/admin/users" },
    },
    version: {
      list: { url: "/admin/versions" },
      create: { url: "/admin/create-version" },
      edit: { url: "/admin/edit-version/$id" },
    },
  },
};
