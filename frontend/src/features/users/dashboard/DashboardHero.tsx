import React from "react";
import { Rocket, Trophy, School, GraduationCap } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from "@/components/ui/avatar";
import { useAppTranslation } from "@/lib/i18n-typed";

interface DashboardHeroProps {
  user: any;
  profile?: {
    school?: string | null;
    grade?: string | null;
    educationLevel?: string | null;
  };
}

export function DashboardHero({
  user,
  profile,
}: DashboardHeroProps) {
  const { t } = useAppTranslation();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border border-slate-200 dark:border-white/5 p-8 md:p-12 shadow-sm transition-all duration-500">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white dark:border-slate-800 shadow-xl ring-2 ring-primary/20 transition-transform duration-500 hover:rotate-6">
              <AvatarImage src={user?.user?.image || ""} />
              <AvatarFallback className="bg-primary/10 text-primary text-3xl md:text-4xl font-black">
                {user?.user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {/* <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white dark:border-slate-800"></div> */}
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-slate-500 dark:text-slate-400 tracking-tight">
                {t(($) => $.exam.sessions.dashboard.welcome)} !
              </h1>
            </div>

            <div className="flex justify-center md:justify-start items-center gap-3 text-slate-900 dark:text-white">
              <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter leading-tight">
                {user?.user?.name || "User"}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg font-medium max-w-xl leading-relaxed mx-auto md:mx-0">
              {t(($) => $.exam.sessions.dashboard.description)}
            </p>

            {(profile?.school || profile?.grade) && (
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 pt-2">
                {profile?.school && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm transition-all hover:bg-white/60 dark:hover:bg-white/10">
                    <School className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {profile.school}
                    </span>
                  </div>
                )}
                {profile?.grade && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-sm transition-all hover:bg-white/60 dark:hover:bg-white/10">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {t(($) => $.exam.sessions.dashboard.stats.gradeLabel)} {profile.grade}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Floating Icons for Aesthetic */}
      <Rocket className="absolute top-10 right-20 w-12 h-12 text-white/5 -rotate-12 animate-pulse" />
      <Trophy className="absolute bottom-10 right-40 w-16 h-16 text-white/5 rotate-12" />
    </div>
  );
}
