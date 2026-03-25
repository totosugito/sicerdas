import React from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { BookOpen, HelpCircle, Lightbulb } from "lucide-react";
import { ExamQuestion } from "@/api/exam-questions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetailContent } from "./DetailContent";
import { DetailSolutions } from "./DetailSolutions";
import { DetailInfo } from "./DetailInfo";

interface QuestionDetailViewProps {
  question: ExamQuestion;
  currentTab: string;
  onTabChange: (value: string) => void;
}

export function QuestionDetailView({ question, currentTab, onTabChange }: QuestionDetailViewProps) {
  const { t } = useAppTranslation();

  return (
    <div className="flex flex-col gap-0 w-full pb-10">
      <Tabs value={currentTab} onValueChange={onTabChange} className="w-full gap-0">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px] mb-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t(($) => $.exam.questions.detail.tabs.content)}
            </span>
          </TabsTrigger>
          <TabsTrigger value="solutions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t(($) => $.exam.questions.detail.tabs.solutions)}
            </span>
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t(($) => $.exam.questions.detail.tabs.info)}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-0">
          <DetailContent question={question} />
        </TabsContent>

        <TabsContent value="solutions" className="mt-0">
          <DetailSolutions question={question} />
        </TabsContent>

        <TabsContent value="info" className="mt-0">
          <DetailInfo question={question} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
