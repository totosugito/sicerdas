import React from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Monitor, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-route";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

interface ResultsActionsProps {
  sessionId: string;
}

export const ResultsActions: React.FC<ResultsActionsProps> = ({ sessionId }) => {
  const { t } = useAppTranslation();

  const buttonBaseClass = "w-full gap-2 transition-all duration-300";

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Link to={AppRoute.exam.exams.url} className="flex-1">
        <Button
          variant="outline"
          className={cn(buttonBaseClass)}
        >
          <ArrowLeft className="w-4 h-4" />
          {t(($) => $.exam.sessions.results.actions.list)}
        </Button>
      </Link>
      <Link to={AppRoute.exam.session.url} params={{ id: sessionId }} className="flex-1">
        <Button
          variant="secondary"
          className={cn(buttonBaseClass)}
        >
          <Monitor className="w-4 h-4" />
          {t(($) => $.exam.sessions.results.actions.engine)}
        </Button>
      </Link>
      <Link to={AppRoute.exam.exams.url} className="flex-1">
        <Button 
          className={cn(buttonBaseClass)}
        >
          <RotateCcw className="w-4 h-4" />
          {t(($) => $.exam.sessions.results.actions.new)}
        </Button>
      </Link>
    </div>
  );
};
