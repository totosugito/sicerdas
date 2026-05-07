import React from "react";
import { Clock } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Timeline } from "@/components/pages/user/dashboard";

interface ActivityTabProps {
  history: any;
  bookHistory: any[];
}

export function ActivityTab({ history, bookHistory }: ActivityTabProps) {
  return (
    <div className="mt-0 animate-in fade-in duration-300">
      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Activity Timeline</CardTitle>
              <CardDescription className="text-xs font-medium">Chronological history of your learning journey</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Timeline history={history?.items || []} bookHistory={bookHistory} />
        </CardContent>
      </Card>
    </div>
  );
}
