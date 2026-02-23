import { HiOutlineUsers } from "react-icons/hi2";
import { AppRoute } from "@/constants/app-route";
import { BsBracesAsterisk } from "react-icons/bs";
import i18n from '@/i18n';
import { Bookmark } from "lucide-react";

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
          title: t("exam.categories.categories.menu"),
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
          title: "Tier Pricing",
          url: AppRoute.tierPricing.adminList.url,
          icon: HiOutlineUsers,
        },
        {
          title: "Users",
          url: AppRoute.admin.user.list.url,
          icon: HiOutlineUsers,
        },
        {
          title: "Models",
          url: AppRoute.admin.chatAi.models.url,
          icon: BsBracesAsterisk,
        },
      ],
      permitUser: false,
    }
  ]
}
