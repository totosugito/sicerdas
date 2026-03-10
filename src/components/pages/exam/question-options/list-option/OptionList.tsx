import { ExamQuestion } from '@/api/exam-questions';
import { DndContext, closestCenter, DragEndEvent, SensorDescriptor, SensorOptions } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { OptionRow } from './OptionRow';

interface OptionListProps {
    items: NonNullable<ExamQuestion['options']>;
    sensors: SensorDescriptor<SensorOptions>[];
    onDragEnd: (event: DragEndEvent) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
}

export const OptionList = ({ items, sensors, onDragEnd, onDelete, onEdit }: OptionListProps) => {
    return (
        <div className="flex flex-col gap-4 pl-4">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
            >
                <SortableContext
                    items={items.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map((item, index) => (
                        <OptionRow
                            key={item.id}
                            option={item}
                            index={index}
                            onDelete={onDelete}
                            onEdit={onEdit}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};
