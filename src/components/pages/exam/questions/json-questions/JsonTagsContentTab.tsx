import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus, X, Check, ChevronsUpDown } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface JsonTagsContentTabProps {
  tags?: string[];
  availableTags?: string[];
  onUpdate: (tags: string[]) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function JsonTagsContentTab({
  tags = [],
  availableTags = [],
  onUpdate,
  isOpen = true,
  onOpenChange,
}: JsonTagsContentTabProps) {
  const { t } = useAppTranslation();
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const toggleTag = (tag: string) => {
    const isExist = tags.includes(tag);
    if (isExist) {
      onUpdate(tags.filter((t) => t !== tag));
    } else {
      onUpdate([...tags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (searchValue.trim() && !tags.includes(searchValue.trim())) {
      onUpdate([...tags, searchValue.trim()]);
      setSearchValue("");
      setOpen(false);
    }
  };

  return (
    <Card className="shadow-sm overflow-hidden border-border/50 p-6">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pt-0 pb-4 bg-muted/5">
          <CollapsibleTrigger asChild>
            <div className="flex flex-col gap-1 cursor-pointer group flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">
                  {t(($) => $.exam.questions.edit.tags.title)}
                </CardTitle>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform text-muted-foreground group-hover:text-primary",
                    isOpen && "rotate-180",
                  )}
                />
              </div>
              <CardDescription>{t(($) => $.exam.questions.edit.tags.description)}</CardDescription>
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="bg-card p-0 pt-2 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full max-w-[400px] justify-between font-normal shadow-sm h-10 px-4"
                  >
                    <span className="truncate text-muted-foreground">
                      {t(($) => $.exam.questions.edit.tags.placeholder)}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 shadow-lg border-border/50" align="start">
                  <Command shouldFilter={true}>
                    <CommandInput
                      placeholder={t(($) => $.exam.questions.edit.tags.placeholder)}
                      value={searchValue}
                      onValueChange={setSearchValue}
                      className="h-11"
                    />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty className="py-6 text-center flex flex-col gap-3 px-4">
                        {/* <span className="text-sm text-muted-foreground">
                          {t(($) => $.exam.questions.edit.tags.noResult)}
                        </span> */}
                        {searchValue.trim() && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full justify-start gap-2 hover:bg-primary hover:text-white transition-colors"
                            onClick={handleAddCustomTag}
                          >
                            <Plus className="h-4 w-4" />
                            {t(($) => $.exam.questions.edit.tags.addAsNew, { name: searchValue })}
                          </Button>
                        )}
                      </CommandEmpty>
                      <CommandGroup heading={t(($) => $.exam.questions.edit.tags.existingTags)}>
                        {availableTags.map((tag) => (
                          <CommandItem
                            key={tag}
                            value={tag}
                            onSelect={() => {
                              toggleTag(tag);
                              setOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                          >
                            <div
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-colors",
                                tags.includes(tag)
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50",
                              )}
                            >
                              {tags.includes(tag) && <Check className="h-3 w-3" />}
                            </div>
                            {tag}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[40px]">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="pl-3 pr-1.5 py-1.5 gap-2 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all font-medium"
                  >
                    {tag}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTag(tag);
                      }}
                      className="hover:bg-destructive hover:text-white rounded-full p-0.5 transition-all text-primary/60 hover:scale-110"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm italic py-2 px-1">
                  {t(($) => $.exam.questions.edit.tags.empty)}
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
