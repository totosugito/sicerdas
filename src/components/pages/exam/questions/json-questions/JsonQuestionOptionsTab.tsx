import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ExamQuestion } from "@/api/exam-questions";
import { useAppTranslation } from "@/lib/i18n-typed";
import { KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { OptionList } from "@/components/pages/exam/question-options/list-option";
import { DialogModal } from "@/components/custom/components";
import { DialogLocalOptionForm } from "./DialogLocalOptionForm";

interface JsonQuestionOptionsTabProps {
  options?: ExamQuestion["options"];
  onUpdate: (items: NonNullable<ExamQuestion["options"]>) => void;
}

export function JsonQuestionOptionsTab({
  options: initialOptions,
  onUpdate,
}: JsonQuestionOptionsTabProps) {
  const { t } = useAppTranslation();
  const [items, setItems] = useState<NonNullable<ExamQuestion["options"]>>([]);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    NonNullable<ExamQuestion["options"]>[number] | null
  >(null);

  useEffect(() => {
    if (initialOptions) {
      const sorted = [...initialOptions].sort((a, b) => (a.order || 0) - (b.order || 0));
      setItems(sorted);
    }
  }, [initialOptions]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      const newItems = arrayMove(items, oldIndex, newIndex);

      // Assign new orders
      const updatedItemsWithOrder = newItems.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

      // update
      setItems(updatedItemsWithOrder);
      onUpdate(updatedItemsWithOrder);
    }
  };

  const handleDelete = (id: string) => {
    setOptionToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!optionToDelete) return;
    const newItems = items.filter((item) => item.id !== optionToDelete);
    setItems(newItems);
    onUpdate(newItems);
    setShowDeleteDialog(false);
    setOptionToDelete(null);
  };

  const handleEdit = (id: string) => {
    const option = items.find((item) => item.id === id);
    if (option) {
      setSelectedOption(option);
      setShowFormModal(true);
    }
  };

  const handleAdd = () => {
    setSelectedOption(null);
    setShowFormModal(true);
  };

  const handleFormSubmit = (data: any) => {
    let newItems;
    if (selectedOption) {
      newItems = items.map((item) => (item.id === selectedOption.id ? { ...item, ...data } : item));
    } else {
      newItems = [...items, { ...data, id: `temp-opt-${Date.now()}`, order: items.length + 1 }];
    }
    setItems(newItems);
    onUpdate(newItems);
  };

  return (
    <Card className="shadow-sm overflow-hidden border-border/50 py-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-0 bg-muted/5">
        <div className="flex flex-col gap-1.5 ">
          <CardTitle className="text-xl">{t(($) => $.exam.options.title)}</CardTitle>
          <CardDescription>{t(($) => $.exam.options.description)}</CardDescription>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shadow-md hover:scale-105 transition-transform"
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4" /> {t(($) => $.exam.options.addButton)}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 pt-0 pb-2 min-h-[300px]">
        {items.length > 0 ? (
          <OptionList
            items={items}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
            <p className="text-muted-foreground italic text-sm">{t(($) => $.exam.options.empty)}</p>
          </div>
        )}

        <DialogLocalOptionForm
          open={showFormModal}
          onOpenChange={setShowFormModal}
          option={selectedOption}
          onConfirm={handleFormSubmit}
        />

        <DialogModal
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          modal={{
            title: t(($) => $.exam.options.delete.confirmTitle),
            desc: t(($) => $.exam.options.delete.confirmDesc),
            variant: "destructive",
            iconType: "error",
            textConfirm: t(($) => $.labels.delete),
            textCancel: t(($) => $.labels.cancel),
            onConfirmClick: confirmDelete,
          }}
        />
      </CardContent>
    </Card>
  );
}
