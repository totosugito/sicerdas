import { MdOutlineDashboard, MdOutlineWorkHistory } from "react-icons/md";
import { TbFileReport } from "react-icons/tb";
import { HiOutlineDocumentChartBar, HiOutlineUsers } from "react-icons/hi2";
import { LuTable2 } from "react-icons/lu";
import { AppRoute } from "@/constants/app-route";
import { CiBoxList } from "react-icons/ci";
import { GoFileDirectory } from "react-icons/go";
import { AiOutlineDashboard } from "react-icons/ai";
import { RiGuideLine } from "react-icons/ri";
import { BsBracesAsterisk } from "react-icons/bs";
import { GrScorecard } from "react-icons/gr";
import { PiUsersThree } from "react-icons/pi";
import { BsGrid } from "react-icons/bs";
import { IoIosNotificationsOutline } from "react-icons/io";

export const AdminNav = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [],
  navGroups: [
    {
      title: "DATA MANAGEMENT",
      items: [
      ]
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
      permitContractor: false
    }
  ]
}
