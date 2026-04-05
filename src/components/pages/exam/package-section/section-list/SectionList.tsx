import { ExamPackageSection } from "@/api/exam-package-sections";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SectionRow } from "./SectionRow";
import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, FolderRoot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionListProps {
  items: ExamPackageSection[];
  sensors: SensorDescriptor<SensorOptions>[];
  onDragEnd: (event: DragEndEvent) => void;
  onDelete: (id: string, title: string) => void;
  onEdit: (section: ExamPackageSection) => void;
}

export const SectionList = ({ items, sensors, onDragEnd, onDelete, onEdit }: SectionListProps) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Logic to determine headers (Sequential comparison)
  const listWithHeaders = useMemo(() => {
    const result: { type: "header" | "item"; data: any; key: string }[] = [];
    let lastGroupName: string | undefined = undefined;

    items.forEach((item, index) => {
      const groupName = item.groupName || "";

      // If this item has a group and it's different from the previous one
      if (groupName && groupName !== lastGroupName) {
        result.push({
          type: "header",
          data: groupName,
          key: `group-header-${groupName}-${index}`,
        });
      }

      result.push({
        type: "item",
        data: item,
        key: item.id,
      });

      lastGroupName = groupName;
    });

    return result;
  }, [items]);

  return (
    <div className="flex flex-col gap-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {listWithHeaders.map((entry) => {
            if (entry.type === "header") {
              const name = entry.data;
              const isCollapsed = collapsedGroups[name];
              return (
                <div
                  key={entry.key}
                  onClick={() => toggleGroup(name)}
                  className="group/header mt-4 flex cursor-pointer select-none items-center gap-3 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/[0.03] to-transparent py-2.5 pl-3 pr-4 transition-all hover:border-primary/20 hover:bg-primary/[0.05]"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover/header:rotate-6">
                    <FolderRoot className="h-4 w-4" />
                  </div>

                  <span className="text-sm font-bold tracking-tight text-foreground/90">
                    {name}
                  </span>

                  <div className="ml-auto flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground/60 transition-all hover:bg-primary/20 hover:text-primary active:scale-95"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            }

            const section = entry.data as ExamPackageSection;
            const groupName = section.groupName || "";
            const isHidden = groupName && collapsedGroups[groupName];

            if (isHidden) return null;

            return (
              <SectionRow key={entry.key} section={section} onDelete={onDelete} onEdit={onEdit} />
            );
          })}
        </SortableContext>
      </DndContext>
    </div>
  );
};
