import React from "react";
import { Link } from "@tanstack/react-router";
import { LayoutGrid, BookOpen, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-route";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

interface ResultsActionsProps {
  sessionId: string;
  packageId?: string;
}

export const ResultsActions: React.FC<ResultsActionsProps> = ({ sessionId, packageId }) => {
  const { t } = useAppTranslation();

  const buttonBaseClass = "w-full sm:w-auto gap-2.5 transition-all duration-300 bg-background/80 backdrop-blur hover:bg-background/100 border-border/50 font-bold px-5";

  return (
    <>
      <Link to={AppRoute.exam.exams.url}>
        <Button
          variant="outline"
          className={cn(buttonBaseClass)}
        >
          <LayoutGrid className="w-4 h-4 text-primary/70" />
          {t(($) => $.exam.sessions.results.actions.list)}
        </Button>
      </Link>
      
      {packageId && (
        <Link to={AppRoute.exam.packages.detail.url} params={{ id: packageId }}>
          <Button
            variant="outline"
            className={cn(buttonBaseClass)}
          >
            <BookOpen className="w-4 h-4 text-primary/70" />
            {t(($) => $.exam.packages.detail.title)}
          </Button>
        </Link>
      )}

      <Link to={AppRoute.exam.session.url} params={{ id: sessionId }}>
        <Button 
          className={cn("w-full sm:w-auto gap-2.5 bg-primary text-primary-foreground shadow-elevated hover:bg-primary/90 border-0 font-bold px-6")}
        >
          <Eye className="w-4.5 h-4.5" />
          {t(($) => $.exam.sessions.results.actions.engine)}
        </Button>
      </Link>
    </>
  );
};
