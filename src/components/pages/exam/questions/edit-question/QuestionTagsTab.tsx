import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tag as TagIcon, Search, X, Loader2, Plus } from "lucide-react";
import { ExamQuestion } from "@/api/exam-questions";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useListTagSimple, useCreateTag } from "@/api/education-tags";
import { useAssignQuestionTag, useUnassignQuestionTag } from "@/api/exam-question-tags";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface QuestionTagsTabProps {
  questionId: string;
  tags?: ExamQuestion["tags"];
}

export function QuestionTagsTab({ questionId, tags = [] }: QuestionTagsTabProps) {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  // Queries & Mutations
  const { data: allTagsData, isLoading: isLoadingTags } = useListTagSimple({ limit: 1000 });
  const assignMutation = useAssignQuestionTag();
  const unassignMutation = useUnassignQuestionTag();
  const createTagMutation = useCreateTag();

  const [searchValue, setSearchValue] = useState("");

  const allTags = allTagsData?.data.items || [];

  // Filter out tags that are already assigned to the question
  const availableTags = allTags.filter(
    (tag) => !tags.some((assignedTag) => assignedTag.id === tag.value),
  );

  const handleAssign = async (tagId: string) => {
    try {
      await assignMutation.mutateAsync({
        questionId,
        tagIds: [tagId],
      });
      showNotifSuccess({ message: t(($) => $.labels.success) });
      queryClient.invalidateQueries({ queryKey: ["admin-exam-question-detail"] });
      setOpen(false);
    } catch (error: any) {
      showNotifError({ message: error.message || t(($) => $.labels.error) });
    }
  };

  const handleUnassign = async (tagId: string) => {
    try {
      await unassignMutation.mutateAsync({
        questionId,
        tagIds: [tagId],
      });
      showNotifSuccess({ message: t(($) => $.labels.success) });
      queryClient.invalidateQueries({ queryKey: ["admin-exam-question-detail"] });
    } catch (error: any) {
      showNotifError({ message: error.message || t(($) => $.labels.error) });
    }
  };

  const handleCreateAndAssignTag = async () => {
    if (!searchValue.trim()) return;
    try {
      const newTag = await createTagMutation.mutateAsync({
        name: searchValue.trim(),
        isActive: true,
      });

      if (newTag.data?.id) {
        // Invalidate the tags list so the new tag appears in the dropdown next time
        queryClient.invalidateQueries({ queryKey: ["education-tags-list-simple"] });
        await handleAssign(newTag.data.id);
        setSearchValue("");
      }
    } catch (error: any) {
      showNotifError({ message: error.message || t(($) => $.labels.error) });
    }
  };

  return (
    <Card className="border-t-0 rounded-t-none">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl">{t(($) => $.exam.tags.title)}</CardTitle>
        <CardDescription>{t(($) => $.exam.tags.description)}</CardDescription>
      </CardHeader>
      <CardContent className="py-0">
        <div className="mx-auto space-y-8 bg-muted/5 p-5 border border-dashed rounded-3xl group/container transition-colors hover:bg-muted/10">
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold">
              <TagIcon className="h-4 w-4 text-primary" /> {t(($) => $.exam.tags.label)}
            </Label>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <button className="w-full text-left outline-none">
                  <div
                    className={cn(
                      "h-10 w-full bg-background rounded-md border transition-all flex items-center px-3 gap-2 text-sm",
                      open
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-input hover:border-primary/50",
                    )}
                  >
                    <Search
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        open ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="text-muted-foreground flex-1 truncate">
                      {t(($) => $.exam.tags.placeholder)}
                    </span>
                    {(assignMutation.isPending || unassignMutation.isPending) && (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                    )}
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl overflow-hidden border-2 shadow-2xl"
                align="start"
                sideOffset={8}
              >
                <Command className="rounded-none">
                  <CommandInput
                    placeholder={t(($) => $.labels.search) + "..."}
                    className="h-12"
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty className="py-6 text-center text-sm text-muted-foreground flex flex-col gap-3 px-4">
                      {isLoadingTags ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t(($) => $.labels.loading)}
                        </div>
                      ) : (
                        <>
                          {searchValue.trim() && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="w-full justify-start gap-2 hover:bg-primary hover:text-white transition-colors"
                              onClick={handleCreateAndAssignTag}
                              disabled={createTagMutation.isPending}
                            >
                              <Plus className="h-4 w-4" />
                              {t(($) => $.exam.questions.edit.tags.addAsNew, { name: searchValue })}
                            </Button>
                          )}
                        </>
                      )}
                    </CommandEmpty>
                    <CommandGroup heading="Rekomendasi Tag Materi" className="p-2">
                      {availableTags.map((tag) => (
                        <CommandItem
                          key={tag.value}
                          value={tag.label}
                          onSelect={() => handleAssign(tag.value)}
                          className="rounded-xl h-11 px-3 cursor-pointer flex items-center gap-3 data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                        >
                          <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                            <TagIcon className="h-4 w-4 opacity-70" />
                          </div>
                          <span className="font-medium">{tag.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-1">
              {t(($) => $.exam.tags.currentTags)}
            </Label>
            <div className="flex flex-wrap gap-2.5">
              {tags && tags.length > 0 ? (
                tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="pl-2 pr-1.5 py-1 rounded-2xl bg-primary/5 hover:bg-primary/10 text-primary border-primary/10 gap-3 group/badge transition-all hover:scale-[1.02] active:scale-95 cursor-default shadow-sm"
                  >
                    <p className="text-sm">{tag.name}</p>
                    <button
                      onClick={() => handleUnassign(tag.id)}
                      disabled={unassignMutation.isPending}
                      className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-red-500 hover:text-white transition-all transform group-hover/badge:scale-110 active:scale-90 disabled:opacity-50"
                    >
                      <X className="h-3 w-3" strokeWidth={3} />
                    </button>
                  </Badge>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center w-full py-4 text-muted-foreground/40 border-2 border-dashed border-muted/50 rounded-2xl bg-muted/5">
                  <TagIcon className="h-8 w-8 mb-2 opacity-20" />
                  <span className="text-xs italic font-medium">{t(($) => $.exam.tags.empty)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
