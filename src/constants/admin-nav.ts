import { HiOutlineUsers } from "react-icons/hi2";
import { AppRoute } from "@/constants/app-route";
import i18n from '@/i18n';
import { Badge, Bookmark, BookTemplateIcon, CalendarCheck2, DollarSign, GraduationCap, LucideBadge, School, School2, TagsIcon } from "lucide-react";

const t = i18n.t;
export const AdminNav = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [],
  navGroups: [
    {
      title: t("labels.management").toUpperCase(),
      items: [
        {
          title: t("exam.menu"),
          url: "/base",
          icon: CalendarCheck2,
          items: [
            {
              title: t("exam.packages.list.menu"),
              url: AppRoute.exam.packages.admin.list.url,
              icon: BookTemplateIcon,
            },
            {
              title: t("exam.subjects.list.menu"),
              url: AppRoute.exam.subjects.admin.list.url,
              icon: TagsIcon,
            },
            {
              title: t("exam.tags.list.menu"),
              url: AppRoute.exam.tags.admin.list.url,
              icon: Badge,
            },
          ]
        },
        {
          title: t("education.title"),
          url: "/base",
          icon: School,
          items: [
            {
              title: t("education.categories.menu"),
              url: AppRoute.education.categories.admin.list.url,
              icon: Bookmark,
            },
            {
              title: t("education.grade.menu"),
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
          title: t("appTier.title"),
          url: AppRoute.appTier.adminList.url,
          icon: DollarSign,
        },
        {
          title: t("user.title"),
          url: AppRoute.admin.user.list.url,
          icon: HiOutlineUsers,
        },
      ],
      permitUser: false,
    }
  ]
}
