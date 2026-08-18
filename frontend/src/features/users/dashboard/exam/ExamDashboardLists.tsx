import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Play, Award, Bookmark } from "lucide-react";
import { useAllSessionHistory } from "@/api/exam/sessions/all";
import { EnumExamSessionStatus } from "@/api/exam/sessions/types";
import { SessionsRecentList } from "./SessionsRecentList";
import { PackagesFavoriteList } from "./PackagesFavoriteList";
import { useAppTranslation } from "@/lib/i18n-typed";

interface ExamDashboardListsProps {
  activePage: number;
  onActivePageChange: (page: number) => void;
  completedPage: number;
  onCompletedPageChange: (page: number) => void;
  favPage: number;
  onFavPageChange: (page: number) => void;
  className?: string;
}

export const ExamDashboardLists = ({
  activePage,
  onActivePageChange,
  completedPage,
  onCompletedPageChange,
  favPage,
  onFavPageChange,
  className,
}: ExamDashboardListsProps) => {
  const { t } = useAppTranslation();
  const [subTab, setSubTab] = useState<string>("active");

  // Fetch active sessions
  const { data: activeRes, isLoading: isLoadingActive } = useAllSessionHistory(
    {
      limit: 5,
      page: activePage,
      status: EnumExamSessionStatus.IN_PROGRESS,
    },
    { enabled: subTab === "active" }
  );

  // Fetch completed sessions
  const { data: completedRes, isLoading: isLoadingCompleted } = useAllSessionHistory(
    {
      limit: 5,
      page: completedPage,
      status: EnumExamSessionStatus.COMPLETED,
    },
    { enabled: subTab === "completed" }
  );

  return (
    <Card className={`w-full shadow-sm overflow-hidden flex flex-col ${className || ""}`}>
      <CardHeader className="bg-muted/10 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">
              {t(($) => $.exam.sessions.history.title)}
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              {t(($) => $.exam.sessions.dashboard.description)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <Tabs value={subTab} onValueChange={setSubTab} className="w-full flex-1 flex flex-col">
          <div className="px-6 pt-5 pb-2">
            <TabsList>
              {[
                { value: "active", label: t(($) => $.course.dashboard.tabs.active), icon: Play },
                { value: "completed", label: t(($) => $.course.dashboard.tabs.completed), icon: Award },
                { value: "favorites", label: t(($) => $.course.dashboard.tabs.favorites), icon: Bookmark },
              ].map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="active" className="mt-0 outline-none flex-1 flex flex-col">
            <SessionsRecentList
              history={activeRes?.data}
              isLoading={isLoadingActive}
              page={activePage}
              onPageChange={onActivePageChange}
              hideCard
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-0 outline-none flex-1 flex flex-col">
            <SessionsRecentList
              history={completedRes?.data}
              isLoading={isLoadingCompleted}
              page={completedPage}
              onPageChange={onCompletedPageChange}
              hideCard
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-0 outline-none flex-1 flex flex-col">
            <PackagesFavoriteList
              page={favPage}
              onPageChange={onFavPageChange}
              hideCard
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
