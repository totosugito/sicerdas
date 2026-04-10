import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppTranslation } from "@/lib/i18n-typed";
import { JsonEditor, githubDarkTheme } from "json-edit-react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { VariableFormulas } from "@/api/exam-questions/types";

interface QuestionVariablesTabProps {
  variableFormulas: VariableFormulas | null | undefined;
  onSubmit: (values: { variableFormulas: VariableFormulas }) => void;
  isPending: boolean;
}

export function QuestionVariablesTab({
  variableFormulas,
  onSubmit,
  isPending,
}: QuestionVariablesTabProps) {
  const { t } = useAppTranslation();

  // Initialize with the data provided, falling back to a default structure
  const initialData = variableFormulas || {
    variables: [],
    solutions: {},
  };

  const [localData, setLocalData] = useState<any>(initialData);

  const handleSave = () => {
    onSubmit({ variableFormulas: localData });
  };

  return (
    <Card className="border-t-0 rounded-t-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl">
            {t(($) => $.exam.questions.edit.variables.title)}
          </CardTitle>
          <CardDescription>{t(($) => $.exam.questions.edit.variables.description)}</CardDescription>
        </div>
        <Button onClick={handleSave} disabled={isPending} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {t(($) => $.labels.save)}
        </Button>
      </CardHeader>
      <CardContent className="">
        <div className="rounded-md border bg-muted/30 p-1 min-h-[400px]">
          <JsonEditor
            data={localData}
            setData={(newData) => {
              setLocalData(newData);
            }}
            theme={githubDarkTheme}
            restrictEdit={false}
            restrictAdd={false}
            restrictDelete={false}
            maxWidth="100%"
          />
        </div>
      </CardContent>
    </Card>
  );
}
