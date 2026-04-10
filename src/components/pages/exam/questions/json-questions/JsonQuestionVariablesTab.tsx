import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, Database } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { JsonEditor, githubDarkTheme } from "json-edit-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { VariableFormulas } from "@/api/exam-questions/types";

interface JsonQuestionVariablesTabProps {
  variableFormulas: VariableFormulas | null | undefined;
  onUpdate: (variableFormulas: VariableFormulas) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function JsonQuestionVariablesTab({
  variableFormulas,
  onUpdate,
  isOpen = true,
  onOpenChange,
}: JsonQuestionVariablesTabProps) {
  const { t } = useAppTranslation();

  const initialData = variableFormulas || {
    variables: [],
    solutions: {},
  };

  return (
    <Card className="shadow-sm overflow-hidden border-border/50 p-6">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pt-0 pb-4 bg-muted/5">
          <CollapsibleTrigger asChild>
            <div className="flex flex-col gap-1 cursor-pointer group flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">
                  {t(($) => $.exam.questions.edit.variables.title)}
                </CardTitle>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform text-muted-foreground group-hover:text-primary",
                    isOpen && "rotate-180",
                  )}
                />
              </div>
              <CardDescription>
                {t(($) => $.exam.questions.edit.variables.description)}
              </CardDescription>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="bg-card p-0">
            <div className="rounded-xl border bg-background/50 backdrop-blur-sm p-2 min-h-[200px]">
              <JsonEditor
                data={initialData}
                setData={(newData) => onUpdate(newData as VariableFormulas)}
                theme={githubDarkTheme}
                restrictEdit={false}
                restrictAdd={false}
                restrictDelete={false}
                maxWidth="100%"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
