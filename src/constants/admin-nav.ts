import { HiOutlineUsers } from "react-icons/hi2";
import { AppRoute } from "@/constants/app-route";
import i18n from '@/i18n';
import { Badge, Bookmark, BookTemplateIcon, DollarSign, LucideBadge } from "lucide-react";

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
      title: t("exam.menu").toUpperCase(),
      items: [
        {
          title: t("exam.packages.list.menu"),
          url: AppRoute.exam.packages.admin.list.url,
          icon: BookTemplateIcon,
        },
        {
          title: t("exam.tags.list.menu"),
          url: AppRoute.exam.tags.admin.list.url,
          icon: Badge,
        },
        {
          title: t("exam.categories.list.menu"),
          url: AppRoute.exam.categories.admin.list.url,
          icon: Bookmark,
        },
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
