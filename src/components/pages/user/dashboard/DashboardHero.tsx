import React from "react";
import { Clock, Rocket, Trophy } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useAppTranslation } from "@/lib/i18n-typed";

interface DashboardHeroProps {
  user: any;
  activityDays: number;
  handleDaysChange: (value: string) => void;
}

export function DashboardHero({
  user,
  activityDays,
  handleDaysChange,
}: DashboardHeroProps) {
  const { t } = useAppTranslation();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-white/5 p-8 md:p-12 shadow-sm transition-all duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-800 shadow-lg relative">
              <AvatarImage src={user?.user?.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl font-black">
                {user?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white dark:border-slate-800"></div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {t(($) => $.exam.sessions.dashboard.title)}, <span className="text-primary">{user?.user?.name?.split(' ')[0] || "User"}</span> !
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl leading-relaxed">
              {t(($) => $.exam.sessions.dashboard.description)}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
          <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 p-1.5 rounded-2xl flex items-center gap-2 shadow-sm">
            <Select value={activityDays.toString()} onValueChange={handleDaysChange}>
              <SelectTrigger className="w-[160px] bg-transparent border-none text-slate-700 dark:text-slate-200 font-bold text-sm h-10 focus:ring-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Last {activityDays} Days</span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800">
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Floating Icons for Aesthetic */}
      <Rocket className="absolute top-10 right-20 w-12 h-12 text-white/5 -rotate-12 animate-pulse" />
      <Trophy className="absolute bottom-10 right-40 w-16 h-16 text-white/5 rotate-12" />
    </div>
  );
}
