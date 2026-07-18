import { TierItem } from '@/api/tier';
import { DndContext, closestCenter, DragEndEvent, SensorDescriptor, SensorOptions } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TierRow } from './TierRow';

interface TierListProps {
    items: TierItem[];
    sensors: SensorDescriptor<SensorOptions>[];
    onDragEnd: (event: DragEndEvent) => void;
    onDelete: (slug: string, name: string) => void;
}

export const TierList = ({ items, sensors, onDragEnd, onDelete }: TierListProps) => {
    return (
        <div className="">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
            >
                <SortableContext
                    items={items.map(item => item.slug)}
                    strategy={verticalListSortingStrategy}
                >
                    {items.map((item) => (
                        <TierRow key={item.slug} tier={item} onDelete={onDelete} />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};
