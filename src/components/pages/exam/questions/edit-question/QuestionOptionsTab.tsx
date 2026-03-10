import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ExamQuestion } from '@/api/exam-questions';
import { useAppTranslation } from '@/lib/i18n-typed';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DialogQuestionOptionForm } from './option-list/DialogQuestionOptionForm';
import { DialogModal } from '@/components/custom/components';
import { useDeleteQuestionOption, useUpdateQuestionOption } from '@/api/exam-question-options';
import { OptionList } from './option-list/OptionList';
import { showNotifSuccess, showNotifError } from '@/lib/show-notif';
import { useQueryClient } from '@tanstack/react-query';

interface QuestionOptionsTabProps {
    questionId: string;
    options?: ExamQuestion['options'];
}

export function QuestionOptionsTab({ questionId, options: initialOptions }: QuestionOptionsTabProps) {
    const { t } = useAppTranslation();
    const queryClient = useQueryClient();
    const updateMutation = useUpdateQuestionOption();
    const [items, setItems] = useState<NonNullable<ExamQuestion['options']>>([]);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [optionToDelete, setOptionToDelete] = useState<string | null>(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedOption, setSelectedOption] = useState<NonNullable<ExamQuestion['options']>[number] | null>(null);

    const deleteMutation = useDeleteQuestionOption();

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
                showNotifSuccess({ message: t($ => $.exam.questions.edit.options.orderSuccess) });
                queryClient.invalidateQueries({ queryKey: ['admin-exam-question-detail'] });
            }).catch((error: any) => {
                showNotifError({ message: error.message || t($ => $.exam.questions.edit.options.orderError) });
                queryClient.invalidateQueries({ queryKey: ['admin-exam-question-detail'] });
            });
        }
    };

    const handleDelete = (id: string) => {
        setOptionToDelete(id);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        if (!optionToDelete) return;

        deleteMutation.mutate(optionToDelete, {
            onSuccess: (res) => {
                showNotifSuccess({ message: res.message || t($ => $.labels.delete) + " " + t($ => $.labels.active) });
                queryClient.invalidateQueries({ queryKey: ['admin-exam-question-detail'] });
                setShowDeleteDialog(false);
                setOptionToDelete(null);
            },
            onError: (error: any) => {
                showNotifError({ message: error.message || t($ => $.labels.error) });
                setShowDeleteDialog(false);
                setOptionToDelete(null);
            }
        });
    };

    const handleEdit = (id: string) => {
        const option = items.find(item => item.id === id);
        if (option) {
            setSelectedOption(option);
            setShowFormModal(true);
        }
    };

    const handleAdd = () => {
        setSelectedOption(null);
        setShowFormModal(true);
    };

    return (
        <Card className="border-t-0 rounded-t-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className='flex flex-col gap-1.5 '>
                    <CardTitle className="text-xl">
                        {t($ => $.exam.questions.edit.options.title)}
                    </CardTitle>
                    <CardDescription>
                        {t($ => $.exam.questions.edit.options.description)}
                    </CardDescription>
                </div>
                <Button
                    size="sm"
                    className="gap-1.5 shadow-md hover:scale-105 transition-transform"
                    onClick={handleAdd}
                >
                    <Plus className="h-4 w-4" /> {t($ => $.exam.questions.edit.options.addButton)}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {items.length > 0 ? (
                    <OptionList
                        items={items}
                        sensors={sensors}
                        onDragEnd={handleDragEnd}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-muted/5">
                        <p className="text-muted-foreground italic">
                            {t($ => $.exam.questions.edit.options.empty)}
                        </p>
                    </div>
                )}

                <DialogQuestionOptionForm
                    open={showFormModal}
                    onOpenChange={setShowFormModal}
                    questionId={questionId}
                    option={selectedOption}
                    nextOrder={items.length + 1}
                />

                <DialogModal
                    open={showDeleteDialog}
                    onOpenChange={setShowDeleteDialog}
                    modal={{
                        title: t($ => $.exam.questions.delete.confirmTitle),
                        desc: t($ => $.exam.questions.delete.confirmDesc),
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
