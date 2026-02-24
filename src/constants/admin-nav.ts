import { HiOutlineUsers } from "react-icons/hi2";
import { AppRoute } from "@/constants/app-route";
import i18n from '@/i18n';
import { Bookmark, DollarSign } from "lucide-react";

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
