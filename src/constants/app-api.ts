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
    subjects: {
      admin: {
        create: APP_URL_API + "/exam/subjects/admin/create",
        update: APP_URL_API + "/exam/subjects/admin/update/:id",
        delete: APP_URL_API + "/exam/subjects/admin/delete/:id",
      },
      list: APP_URL_API + "/exam/subjects/list",
      listSimple: APP_URL_API + "/exam/subjects/list-simple",
      detail: APP_URL_API + "/exam/subjects/detail/:id",
    },
    packages: {
      admin: {
        create: APP_URL_API + "/exam/packages/admin/create",
        update: APP_URL_API + "/exam/packages/admin/update/:id",
        delete: APP_URL_API + "/exam/packages/admin/delete/:id",
      },
      list: APP_URL_API + "/exam/packages/list",
      listSimple: APP_URL_API + "/exam/packages/list-simple",
      detail: APP_URL_API + "/exam/packages/detail/:id",
    },
    packageSections: {
      admin: {
        create: APP_URL_API + "/exam/package-sections/admin/create",
        update: APP_URL_API + "/exam/package-sections/admin/update/:id",
        delete: APP_URL_API + "/exam/package-sections/admin/delete/:id",
      },
      list: APP_URL_API + "/exam/package-sections/list",
      listSimple: APP_URL_API + "/exam/package-sections/list-simple",
    },
    passages: {
      admin: {
        create: APP_URL_API + "/exam/passages/admin/create",
        detail: APP_URL_API + "/exam/passages/admin/detail/:id",
        update: APP_URL_API + "/exam/passages/admin/update/:id",
        delete: APP_URL_API + "/exam/passages/admin/delete/:id",
        list: APP_URL_API + "/exam/passages/admin/list",
        listSimple: APP_URL_API + "/exam/passages/admin/list-simple",
      },
    },
    questions: {
      admin: {
        create: APP_URL_API + "/exam/questions/admin/create",
        update: APP_URL_API + "/exam/questions/admin/update/:id",
        detail: APP_URL_API + "/exam/questions/admin/detail/:id",
        delete: APP_URL_API + "/exam/questions/admin/delete/:id",
        list: APP_URL_API + "/exam/questions/admin/list",
      },
    },
    questionOptions: {
      admin: {
        create: APP_URL_API + "/exam/question-options/admin/create",
        update: APP_URL_API + "/exam/question-options/admin/update/:id",
        delete: APP_URL_API + "/exam/question-options/admin/delete/:id",
        deletes: APP_URL_API + "/exam/question-options/admin/deletes",
        list: APP_URL_API + "/exam/question-options/admin/list",
      },
    },
    questionSolutions: {
      admin: {
        create: APP_URL_API + "/exam/question-solutions/admin/create",
        update: APP_URL_API + "/exam/question-solutions/admin/update/:id",
        delete: APP_URL_API + "/exam/question-solutions/admin/delete/:id",
        deletes: APP_URL_API + "/exam/question-solutions/admin/deletes",
        list: APP_URL_API + "/exam/question-solutions/admin/list",
      },
    },
    questionTags: {
      admin: {
        assign: APP_URL_API + "/exam/question-tags/admin/assign",
        unassign: APP_URL_API + "/exam/question-tags/admin/unassign",
        list: APP_URL_API + "/exam/question-tags/admin/list",
      },
    },
    packageQuestions: {
      admin: {
        assign: APP_URL_API + "/exam/package-questions/admin/assign",
      },
    },
    sessions: {
      client: {
        start: APP_URL_API + "/exam/sessions/client/start",
        details: APP_URL_API + "/exam/sessions/client/details/:id",
        saveAnswer: APP_URL_API + "/exam/sessions/client/save-answer",
        submit: APP_URL_API + "/exam/sessions/client/submit/:id",
      },
    },
  },
  education: {
    tags: {
      admin: {
        create: APP_URL_API + "/education/tags/admin/create",
        update: APP_URL_API + "/education/tags/admin/update/:id",
        delete: APP_URL_API + "/education/tags/admin/delete/:id",
      },
      list: APP_URL_API + "/education/tags/list",
      listSimple: APP_URL_API + "/education/tags/list-simple",
    },
    grade: {
      admin: {
        create: APP_URL_API + "/education/grades/admin/create",
        update: APP_URL_API + "/education/grades/admin/update/:id",
        delete: APP_URL_API + "/education/grades/admin/delete/:id",
      },
      list: APP_URL_API + "/education/grades/list",
      listSimple: APP_URL_API + "/education/grades/list-simple",
    },
    categories: {
      admin: {
        create: APP_URL_API + "/education/categories/admin/create",
        update: APP_URL_API + "/education/categories/admin/update/:id",
        delete: APP_URL_API + "/education/categories/admin/delete/:id",
      },
      list: APP_URL_API + "/education/categories/list",
      listSimple: APP_URL_API + "/education/categories/list-simple",
    },
  }
}