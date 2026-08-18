import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";
import { UserRound, IdCard, ShieldCheck, Lock, type LucideIcon } from "lucide-react";

type TabDef = {
  value: string;
  icon: LucideIcon;
  labelKey: Parameters<ReturnType<typeof useAppTranslation>["t"]>[0];
};

const tabs: TabDef[] = [
  { value: "profile", icon: UserRound, labelKey: ($) => $.user.profile.tabs.editProfile },
  { value: "personal", icon: IdCard, labelKey: ($) => $.user.profile.tabs.personalInfo },
  { value: "security", icon: ShieldCheck, labelKey: ($) => $.user.profile.tabs.security },
  { value: "privacy", icon: Lock, labelKey: ($) => $.user.profile.tabs.privacy },
];

export function TabNavigation() {
  const { t } = useAppTranslation();

  return (
    <>
      <div className="md:hidden">
        <TabsList className="flex h-auto w-full gap-1 rounded-2xl border bg-muted/50 p-1 mb-3">
            {tabs.map(({ value, icon: Icon, labelKey }) => (
              <TabsTrigger
                key={value}
                value={value}
                aria-label={t(labelKey)}
                className={cn(
                  "flex-1 justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4",
                  "text-muted-foreground hover:text-foreground",
                  "data-active:bg-background data-active:text-primary data-active:shadow-sm"
                )}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{t(labelKey)}</span>
              </TabsTrigger>
            ))}
        </TabsList>
      </div>

      <TabsList className="hidden md:flex h-fit w-full flex-col gap-1 rounded-2xl border bg-muted/40 p-2">
        {tabs.map(({ value, icon: Icon, labelKey }) => (
          <TabsTrigger
            key={value}
            value={value}
            className={cn(
              "group relative w-full flex-none justify-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
              "text-muted-foreground hover:bg-background/60 hover:text-foreground",
              "data-active:bg-background data-active:text-primary data-active:shadow-sm",
              "before:absolute before:left-0 before:top-1/2 before:h-0 before:w-1 before:-translate-y-1/2 before:rounded-full before:bg-primary before:transition-all before:duration-200",
              "data-active:before:h-5"
            )}
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-lg transition-colors duration-200",
                "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                "group-data-active:bg-primary/10 group-data-active:text-primary"
              )}
            >
              <Icon className="size-4" />
            </span>
            {t(labelKey)}
          </TabsTrigger>
        ))}
      </TabsList>
    </>
  );
}
