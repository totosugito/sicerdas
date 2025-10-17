import LoginForm from "./LoginForm";
import React from "react";
import {LoginFormValues} from "@/types/auth";
import {SubmitHandler} from "react-hook-form";
import { BookOpen } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  onFormSubmit: SubmitHandler<LoginFormValues>
  loading?: boolean
}
const LayoutLogin = ({onFormSubmit, loading}: Props) => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4 relative">
      {/* Main content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header section */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/15 dark:bg-primary/20 rounded-full mb-4 backdrop-blur-sm border border-primary/40 dark:border-primary/30">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <span className="bg-gradient-to-r from-primary to-chart-1 bg-clip-text text-transparent">
              {t("login.title")}
            </span>
          </h1>
          {/* <p className="text-muted-foreground text-lg mb-2">{t("login.subtitle")}</p> */}
          <p className="text-sm text-muted-foreground/80">{t("login.tagline")}</p>
        </div>

        {/* Login card */}
        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl transition-all hover:shadow-3xl hover:border-primary/30">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">{t("login.welcomeBack")}</h2>
            <p className="text-muted-foreground">{t("login.signInDescription")}</p>
          </div>

          <LoginForm onFormSubmit={onFormSubmit} loading={loading}/>
          
          {/* Additional info */}
          {/* <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center justify-center space-x-6 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <BookOpen size={12} />
                <span>{t("login.statsBooks")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <GraduationCap size={12} />
                <span>{t("login.statsCourses")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={12} />
                <span>{t("login.statsStudents")}</span>
              </div>
            </div>
          </div> */}
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground/70">
          <p>© {new Date().getFullYear()} {t("login.footerCopyright")}</p>
        </div>
      </div>
    </div>
  )
}
export default LayoutLogin;