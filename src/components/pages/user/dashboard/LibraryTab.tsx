import React from "react";
import { History, Bookmark } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { 
  RecentBooksList, 
  FavoriteBooksList 
} from "@/components/pages/user/dashboard";
import { useAppTranslation } from "@/lib/i18n-typed";

export function LibraryTab() {
  const { t } = useAppTranslation();

  return (
    <div className="space-y-6 mt-0 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">{t(($) => $.book.dashboard.history.title)}</CardTitle>
                <CardDescription className="text-xs font-medium">{t(($) => $.book.dashboard.history.description)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <RecentBooksList />
          </CardContent>
        </Card>

        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/10 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold">{t(($) => $.book.dashboard.favorites.title)}</CardTitle>
                <CardDescription className="text-xs font-medium">{t(($) => $.book.dashboard.favorites.description)}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <FavoriteBooksList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
