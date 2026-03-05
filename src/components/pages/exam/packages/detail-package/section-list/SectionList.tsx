import { ExamPackageSection } from '@/api/exam-package-sections';
import { DndContext, closestCenter, DragEndEvent, SensorDescriptor, SensorOptions } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SectionRow } from './SectionRow';

interface SectionListProps {
    items: ExamPackageSection[];
    sensors: SensorDescriptor<SensorOptions>[];
    onDragEnd: (event: DragEndEvent) => void;
    onDelete: (id: string, title: string) => void;
    onEdit: (section: ExamPackageSection) => void;
}

export const SectionList = ({ items, sensors, onDragEnd, onDelete, onEdit }: SectionListProps) => {
    return (
        <div className="">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
            >
                <SortableContext
                    items={items.map(item => item.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map((item) => (
                        <SectionRow key={item.id} section={item} onDelete={onDelete} onEdit={onEdit} />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};
