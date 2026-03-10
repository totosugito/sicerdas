import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ExamQuestion } from '@/api/exam-questions';
import { useAppTranslation } from '@/lib/i18n-typed';
import {
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { SolutionList, DialogQuestionSolutionForm } from '@/components/pages/exam/question-solutions/list-solution';
import { DialogModal } from '@/components/custom/components';
import { useDeleteQuestionSolution, useUpdateQuestionSolution, ExamQuestionSolution } from '@/api/exam-question-solutions';
import { showNotifSuccess, showNotifError } from '@/lib/show-notif';
import { useQueryClient } from '@tanstack/react-query';

interface QuestionSolutionsTabProps {
    questionId: string;
    solutions?: ExamQuestion['solutions'];
}

export function QuestionSolutionsTab({ questionId, solutions: initialSolutions }: QuestionSolutionsTabProps) {
    const { t } = useAppTranslation();
    const queryClient = useQueryClient();
    const updateMutation = useUpdateQuestionSolution();
    const [items, setItems] = useState<ExamQuestionSolution[]>([]);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [solutionToDelete, setSolutionToDelete] = useState<string | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedSolution, setSelectedSolution] = useState<ExamQuestionSolution | null>(null);

    const deleteMutation = useDeleteQuestionSolution();

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
        })
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

            // Optimistic update
            setItems(updatedItemsWithOrder);

            // Persist to backend
            Promise.all(updatedItemsWithOrder.map(item =>
                updateMutation.mutateAsync({
                    id: item.id,
                    order: item.order
                })
            )).then(() => {
                showNotifSuccess({ message: t($ => $.labels.success) });
                queryClient.invalidateQueries({ queryKey: ['admin-exam-question-detail'] });
            }).catch((error: any) => {
                showNotifError({ message: error.message || t($ => $.labels.error) });
                queryClient.invalidateQueries({ queryKey: ['admin-exam-question-detail'] });
            });
        }
    };

    const handleDelete = (id: string) => {
        setSolutionToDelete(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (!solutionToDelete) return;

        deleteMutation.mutate(solutionToDelete, {
            onSuccess: (res) => {
                showNotifSuccess({ message: res.message || t($ => $.labels.delete) + " " + t($ => $.labels.active) });
                queryClient.invalidateQueries({ queryKey: ['admin-exam-question-detail'] });
                setShowDeleteDialog(false);
                setSolutionToDelete(null);
            },
            onError: (error: any) => {
                showNotifError({ message: error.message || t($ => $.labels.error) });
                setShowDeleteDialog(false);
                setSolutionToDelete(null);
            }
        });
    };

    const handleEdit = (id: string) => {
        const solution = items.find(item => item.id === id);
        if (solution) {
            setSelectedSolution(solution);
            setShowFormModal(true);
        }
    };

    const handleAdd = () => {
        setSelectedSolution(null);
        setShowFormModal(true);
    };

    return (
        <Card className="border-t-0 rounded-t-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 text-center sm:text-left">
                <div className='flex flex-col gap-1.5 '>
                    <CardTitle className="text-xl">
                        {t($ => $.exam.solutions.title)}
                    </CardTitle>
                    <CardDescription>
                        {t($ => $.exam.solutions.description)}
                    </CardDescription>
                </div>
                <Button
                    size="sm"
                    className="gap-1.5 shadow-md hover:scale-105 transition-transform"
                    onClick={handleAdd}
                >
                    <Plus className="h-4 w-4" /> {t($ => $.exam.solutions.addButton)}
                </Button>
            </CardHeader>
            <CardContent className="space-y-0">
                {items.length > 0 ? (
                    <SolutionList
                        items={items}
                        sensors={sensors}
                        onDragEnd={handleDragEnd}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-muted/5">
                        <p className="text-muted-foreground italic">
                            {t($ => $.exam.solutions.empty)}
                        </p>
                    </div>
                )}

                <DialogQuestionSolutionForm
                    open={showFormModal}
                    onOpenChange={setShowFormModal}
                    questionId={questionId}
                    solution={selectedSolution}
                    nextOrder={items.length + 1}
                />

                <DialogModal
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    modal={{
                        title: "Hapus Pembahasan",
                        desc: "Apakah Anda yakin ingin menghapus pembahasan ini?",
                        variant: "destructive",
                        iconType: "error",
                        textConfirm: deleteMutation.isPending ? t($ => $.labels.saving) : t($ => $.labels.delete),
                        textCancel: t($ => $.labels.cancel),
                        onConfirmClick: confirmDelete,
                    }}
                />
            </CardContent>
        </Card>
    );
}
