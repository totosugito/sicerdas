import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookMarked, Play, Award, Bookmark } from "lucide-react";
import { CoursesActiveList } from "./CoursesActiveList";
import { CoursesCompletedList } from "./CoursesCompletedList";
import { CoursesFavoriteList } from "./CoursesFavoriteList";
import { useAppTranslation } from "@/lib/i18n-typed";

interface CourseDashboardListsProps {
  activePage: number;
  onActivePageChange: (page: number) => void;
  completedPage: number;
  onCompletedPageChange: (page: number) => void;
  favPage: number;
  onFavPageChange: (page: number) => void;
  className?: string;
}

export const CourseDashboardLists = ({
  activePage,
  onActivePageChange,
  completedPage,
  onCompletedPageChange,
  favPage,
  onFavPageChange,
  className,
}: CourseDashboardListsProps) => {
  const { t } = useAppTranslation();
  const [subTab, setSubTab] = useState<string>("active");

  return (
    <Card className={`w-full shadow-sm overflow-hidden flex flex-col ${className || ""}`}>
      <CardHeader className="bg-muted/10 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <BookMarked className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">{t(($) => $.course.dashboard.title)}</CardTitle>
            <CardDescription className="text-xs font-medium">{t(($) => $.course.dashboard.description)}</CardDescription>
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
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="active" className="mt-0 outline-none flex-1 flex flex-col">
            <CoursesActiveList
              page={activePage}
              onPageChange={onActivePageChange}
            />
          </TabsContent>

          <TabsContent value="completed" className="mt-0 outline-none flex-1 flex flex-col">
            <CoursesCompletedList
              page={completedPage}
              onPageChange={onCompletedPageChange}
            />
          </TabsContent>

          <TabsContent value="favorites" className="mt-0 outline-none flex-1 flex flex-col">
            <CoursesFavoriteList
              page={favPage}
              onPageChange={onFavPageChange}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
