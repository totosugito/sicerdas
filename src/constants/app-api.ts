const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL;
const APP_URL_API = APP_BASE_URL + "/api";
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
  users: {
    admin: {
      list: APP_URL_API + "/users/admin/list",
      delete: APP_URL_API + "/users/admin/delete/:id",
      create: APP_URL_API + "/users/admin/create",
      changePassword: APP_URL_API + "/users/admin/reset-password",
      details: APP_URL_API + "/users/admin/:id",
      update: APP_URL_API + "/users/admin/update",
      avatar: APP_URL_API + "/users/admin/avatar",
      deletes: APP_URL_API + "/users/admin/deletes",
      ban: APP_URL_API + "/users/admin/ban",
    },
    user: {
      details: APP_URL_API + "/users/user/details",
      update: APP_URL_API + "/users/user/update",
      changePassword: APP_URL_API + "/users/user/change-password",
      avatar: APP_URL_API + "/users/user/avatar",
      sessions: APP_URL_API + "/users/user/sessions-list",
      revokeSession: APP_URL_API + "/users/user/multi-session-revoke",
      revokeOtherSessions: APP_URL_API + "/user/revoke-other-sessions-v1",
    },
  },

  ai: {
    models: {
      list: APP_URL_API + "/admin/chat-ai/models/list",
      create: APP_URL_API + "/admin/chat-ai/models",
      crud: APP_URL_API + "/admin/chat-ai/models", // for GET, PATCH, DELETE single
      deleteBatch: APP_URL_API + "/admin/chat-ai/models/delete-batch",
      updateBatch: APP_URL_API + "/admin/chat-ai/models/update-batch",
    },
  },
  book: {
    list: APP_URL_API + "/book/list",
    detail: APP_URL_API + "/book/detail",
    create: APP_URL_API + "/book/create",
    crud: APP_URL_API + "/book",
    filterParams: APP_URL_API + "/book/filter-params",
    proxyPdf: APP_URL_API + "/book/proxy-pdf",
    bookmark: APP_URL_API + "/book/bookmark",
    rating: APP_URL_API + "/book/rating",
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
        list: APP_URL_API + "/exam/packages/admin/list",
        listSimple: APP_URL_API + "/exam/packages/admin/list-simple",
        detail: APP_URL_API + "/exam/packages/admin/detail/:id",
        thumbnail: APP_URL_API + "/exam/packages/admin/thumbnail/:id",
      },
      user: {
        bookmark: APP_URL_API + "/exam/packages/user/bookmark",
      },
      list: APP_URL_API + "/exam/packages/list",
      detail: APP_URL_API + "/exam/packages/detail/:id",
    },
    packageSections: {
      admin: {
        create: APP_URL_API + "/exam/package-sections/admin/create",
        update: APP_URL_API + "/exam/package-sections/admin/update/:id",
        delete: APP_URL_API + "/exam/package-sections/admin/delete/:id",
        list: APP_URL_API + "/exam/package-sections/admin/list",
        listSimple: APP_URL_API + "/exam/package-sections/admin/list-simple",
        detail: APP_URL_API + "/exam/package-sections/admin/detail/:id",
      },
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
        listSimple: APP_URL_API + "/exam/questions/admin/list-simple",
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
        assignByNames: APP_URL_API + "/exam/question-tags/admin/assign-by-names",
        unassign: APP_URL_API + "/exam/question-tags/admin/unassign",
        list: APP_URL_API + "/exam/question-tags/admin/list",
      },
    },
    packageQuestions: {
      admin: {
        list: APP_URL_API + "/exam/package-questions/admin/list",
        assign: APP_URL_API + "/exam/package-questions/admin/assign",
        unassign: APP_URL_API + "/exam/package-questions/admin/unassign",
        syncOrder: APP_URL_API + "/exam/package-questions/admin/sync-order",
      },
    },
    sessions: {
      user: {
        start: APP_URL_API + "/exam/sessions/user/start",
        details: APP_URL_API + "/exam/sessions/user/details/:id",
        saveAnswer: APP_URL_API + "/exam/sessions/user/save-answer",
        submit: APP_URL_API + "/exam/sessions/user/submit/:id",
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
  },
  version: {
    admin: {
      create: APP_URL_API + "/version/admin/create",
      update: APP_URL_API + "/version/admin/update/:id",
      delete: APP_URL_API + "/version/admin/delete/:id",
      detail: APP_URL_API + "/version/admin/detail/:id",
    },
    list: APP_URL_API + "/version/list",
    listSimple: APP_URL_API + "/version/list-simple",
  },
};
