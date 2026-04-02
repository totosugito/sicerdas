import adminBook from "./id/admin-book.json" with { type: "json" };
import admin from "./id/admin.json" with { type: "json" };
import appTier from "./id/app-tier.json" with { type: "json" };
import auth from "./id/auth.json" with { type: "json" };
import book from "./id/book.json" with { type: "json" };
import chatAi from "./id/chat-ai.json" with { type: "json" };
import education from "./id/education.json" with { type: "json" };
import exam from "./id/exam.json" with { type: "json" };
import login from "./id/login.json" with { type: "json" };
import periodic from "./id/periodic.json" with { type: "json" };
import report from "./id/report.json" with { type: "json" };
import user from "./id/user.json" with { type: "json" };
import version from "./id/version.json" with { type: "json" };

const idMessages = {
  admin: {
    ...adminBook.admin,
    ...admin.admin,
  },
  ...appTier,
  ...auth,
  ...book,
  ...chatAi,
  ...education,
  ...exam,
  ...login,
  ...periodic,
  ...report,
  ...user,
  ...version,
};

export type AppLocale = typeof idMessages;
export const defaultLocale: AppLocale = idMessages;
