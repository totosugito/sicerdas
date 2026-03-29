import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, ChevronDown, FileText } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { BlockNoteStatic } from "@/components/custom/components/BlockNoteStatic";
import { DialogLocalContentForm } from "./DialogLocalContentForm";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface JsonQuestionContentTabProps {
  content: any;
  onUpdate: (content: any) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function JsonQuestionContentTab({
  content,
  onUpdate,
  isOpen = true,
  onOpenChange,
}: JsonQuestionContentTabProps) {
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
                  {t(($) => $.exam.questions.edit.content.title)}
                </CardTitle>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform text-muted-foreground group-hover:text-primary",
                    isOpen && "rotate-180",
                  )}
                />
              </div>
              <CardDescription>
                {t(($) => $.exam.questions.edit.content.description)}
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
                content={content}
                className="border-0 shadow-none"
                minHeight="80px"
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <DialogLocalContentForm
        open={showContentDialog}
        onOpenChange={setShowContentDialog}
        content={content}
        onConfirm={onUpdate}
      />
    </Card>
  );
}
