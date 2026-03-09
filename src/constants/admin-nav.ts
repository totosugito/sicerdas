import { HiOutlineUsers } from "react-icons/hi2";
import { AppRoute } from "@/constants/app-route";
import { Badge, BookA, Bookmark, BookPlus, BookSearch, BookTemplateIcon, CalendarCheck2, DollarSign, GraduationCap, School, TagsIcon } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useMemo } from "react";

export const useAdminNav = () => {
  const { t } = useAppTranslation();

  return useMemo(() => ({
    user: {
      name: "Admin",
      email: "admin@example.com",
      avatar: "/avatars/admin.jpg",
    },
    teams: [],
    navGroups: [
      {
        title: t($ => $.labels.management).toUpperCase(),
        items: [
          {
            title: t($ => $.exam.menu),
            url: "/base",
            icon: CalendarCheck2,
            items: [
              {
                title: t($ => $.exam.questions.menu),
                url: AppRoute.exam.questions.admin.list.url,
                icon: BookPlus,
              },
              {
                title: t($ => $.exam.passages.menu),
                url: AppRoute.exam.passages.admin.list.url,
                icon: BookA,
              },
              {
                title: t($ => $.exam.sections.menu),
                url: AppRoute.exam.packageSections.admin.list.url,
                icon: BookSearch,
              },
              {
                title: t($ => $.exam.packages.menu),
                url: AppRoute.exam.packages.admin.list.url,
                icon: BookTemplateIcon,
              },
              {
                title: t($ => $.exam.subjects.menu),
                url: AppRoute.exam.subjects.admin.list.url,
                icon: TagsIcon,
              },
            ]
          },
          {
            title: t($ => $.education.title),
            url: "/base",
            icon: School,
            items: [
              {
                title: t($ => $.education.tags.menu),
                url: AppRoute.education.tags.admin.list.url,
                icon: Badge,
              },
              {
                title: t($ => $.education.categories.menu),
                url: AppRoute.education.categories.admin.list.url,
                icon: Bookmark,
              },
              {
                title: t($ => $.education.grade.menu),
                url: AppRoute.education.grade.admin.list.url,
                icon: GraduationCap,
              },
            ]
          }
        ],
        permitUser: false,
      },
      {
        title: "ADMIN",
        items: [
          {
            title: t($ => $.appTier.title),
            url: AppRoute.appTier.adminList.url,
            icon: DollarSign,
          },
          {
            title: t($ => $.user.title),
            url: AppRoute.admin.user.list.url,
            icon: HiOutlineUsers,
          },
        ],
        permitUser: false,
      }
    ]
  }), [t]);
}
