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
        list: { url: "/exam/admin/list-question" },
        create: { url: "/exam/admin/create-question" },
        edit: { url: "/exam/admin/edit-question/$id" },
        detail: { url: "/exam/admin/detail-question/$id" },
        importJson: { url: "/exam/admin/json-questions" },
        promptGenerator: { url: "/exam/admin/prompt-generator" },
      },
    },
    passages: {
      admin: {
        list: { url: "/exam/admin/list-passage" },
        create: { url: "/exam/admin/create-passage" },
        edit: { url: "/exam/admin/edit-passage/$id" },
      },
    },
    subjects: {
      admin: {
        list: { url: "/exam/admin/list-subject" },
        create: { url: "/exam/admin/create-subject" },
        edit: { url: "/exam/admin/edit-subject/$id" },
      },
    },
    packages: {
      admin: {
        list: { url: "/exam/admin/list-package" },
        create: { url: "/exam/admin/create-package" },
        edit: { url: "/exam/admin/edit-package/$id" },
        detail: { url: "/exam/admin/detail-package/$id" },
      },
    },
    packageSections: {
      admin: {
        list: { url: "/exam/admin/list-section" },
        detail: { url: "/exam/admin/detail-section/$id" },
        edit: { url: "/exam/admin/edit-section/$id" },
        create: { url: "/exam/admin/create-section" },
      },
    },
    exams: { url: "/exam/exams" },
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
    users: {
      list: { url: "/users/list-users" },
    },
    chatAi: {
      models: { url: "/admin/chat-ai/models" },
    },
    version: {
      list: { url: "/admin/versions" },
      create: { url: "/admin/create-version" },
      edit: { url: "/admin/edit-version/$id" },
    },
  },
};
