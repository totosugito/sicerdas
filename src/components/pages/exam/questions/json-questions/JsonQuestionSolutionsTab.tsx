import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { SolutionList } from "@/components/pages/exam/question-solutions/list-solution";
import { DialogModal } from "@/components/custom/components";
import { DialogLocalSolutionForm } from "./DialogLocalSolutionForm";
import { ExamQuestionSolution } from "@/api/exam-question-solutions";
import { ExamQuestion } from "@/api/exam-questions";

interface JsonQuestionSolutionsTabProps {
  solutions?: ExamQuestion["solutions"];
  onUpdate: (items: NonNullable<ExamQuestion["solutions"]>) => void;
}

export function JsonQuestionSolutionsTab({
  solutions: initialSolutions,
  onUpdate,
}: JsonQuestionSolutionsTabProps) {
  const { t } = useAppTranslation();
  const [items, setItems] = useState<ExamQuestionSolution[]>([]);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [solutionToDelete, setSolutionToDelete] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<ExamQuestionSolution | null>(null);

  useEffect(() => {
    if (initialSolutions) {
      const sorted = [...initialSolutions].sort((a, b) => (a.order || 0) - (b.order || 0));
      setItems(sorted as ExamQuestionSolution[]);
    }
  }, [initialSolutions]);

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
      onUpdate(updatedItemsWithOrder as NonNullable<ExamQuestion["solutions"]>);
    }
  };

  const handleDelete = (id: string) => {
    setSolutionToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!solutionToDelete) return;
    const newItems = items.filter((item) => item.id !== solutionToDelete);
    setItems(newItems);
    onUpdate(newItems as NonNullable<ExamQuestion["solutions"]>);
    setShowDeleteDialog(false);
    setSolutionToDelete(null);
  };

  const handleEdit = (id: string) => {
    const solution = items.find((item) => item.id === id);
    if (solution) {
      setSelectedSolution(solution);
      setShowFormModal(true);
    }
  };

  const handleAdd = () => {
    setSelectedSolution(null);
    setShowFormModal(true);
  };

  const handleFormSubmit = (data: any) => {
    let newItems;
    if (selectedSolution) {
      newItems = items.map((item) =>
        item.id === selectedSolution.id ? { ...item, ...data } : item,
      );
    } else {
      newItems = [...items, { ...data, id: `temp-sol-${Date.now()}`, order: items.length + 1 }];
    }
    setItems(newItems);
    onUpdate(newItems as NonNullable<ExamQuestion["solutions"]>);
  };

  return (
    <Card className="shadow-sm overflow-hidden border-border/50 py-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 py-0 bg-muted/5">
        <div className="flex flex-col gap-1.5 ">
          <CardTitle className="text-xl">{t(($) => $.exam.solutions.title)}</CardTitle>
          <CardDescription>{t(($) => $.exam.solutions.description)}</CardDescription>
        </div>
        <Button
          size="sm"
          className="gap-1.5 shadow-md hover:scale-105 transition-transform"
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4" /> {t(($) => $.exam.solutions.addButton)}
        </Button>
      </CardHeader>
      <CardContent className="space-y-0 pt-0 pb-2 min-h-[50px]">
        {items.length > 0 ? (
          <SolutionList
            items={items}
            sensors={sensors}
            onDragEnd={handleDragEnd}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
            <p className="text-muted-foreground italic text-sm">
              {t(($) => $.exam.solutions.empty)}
            </p>
          </div>
        )}

        <DialogLocalSolutionForm
          open={showFormModal}
          onOpenChange={setShowFormModal}
          solution={selectedSolution}
          onConfirm={handleFormSubmit}
        />

        <DialogModal
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          modal={{
            title: t(($) => $.labels.delete),
            desc: t(($) => $.labels.active), // Using generic labels since specific solutions.delete keys are missing
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
