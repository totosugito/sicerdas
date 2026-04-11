import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, ChevronDown } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { BlockNoteStatic } from "@/components/custom/components/block-note";
import { DialogLocalReasonForm } from "./DialogLocalReasonForm";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface JsonQuestionReasonTabProps {
  reasonContent: any;
  onUpdate: (reasonContent: any) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function JsonQuestionReasonTab({
  reasonContent,
  onUpdate,
  isOpen = true,
  onOpenChange,
}: JsonQuestionReasonTabProps) {
  const { t } = useAppTranslation();
  const [showContentDialog, setShowContentDialog] = useState(false);

  return (
    <Card className="shadow-sm overflow-hidden border-border/50 p-6">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pt-0 pb-4 bg-muted/5">
          <CollapsibleTrigger asChild>
            <div className="flex flex-col gap-1 cursor-pointer group flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">
                  {t(($) => $.exam.questions.form.reasonContent.label)}
                </CardTitle>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform text-muted-foreground group-hover:text-primary",
                    isOpen && "rotate-180",
                  )}
                />
              </div>
              <CardDescription>
                {t(($) => $.exam.questions.form.reasonContent.placeholder)}
              </CardDescription>
            </div>
          </CollapsibleTrigger>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 shadow-sm hover:bg-primary hover:text-primary-foreground transition-all ml-4 px-4"
            onClick={() => setShowContentDialog(true)}
          >
            <Pencil className="h-4 w-4" />
            {t(($) => $.labels.edit)}
          </Button>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="bg-card p-0 min-h-[50px]">
            <div className="rounded-xl border bg-background/50 backdrop-blur-sm p-1">
              <BlockNoteStatic
                content={reasonContent || []}
                className="border-0 shadow-none"
                minHeight="80px"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <DialogLocalReasonForm
        open={showContentDialog}
        onOpenChange={setShowContentDialog}
        reasonContent={reasonContent || []}
        onConfirm={onUpdate}
      />
    </Card>
  );
}
