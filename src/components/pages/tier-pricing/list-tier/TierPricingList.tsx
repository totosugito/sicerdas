import { AppTier } from '@/api/app-tier';
import { DndContext, closestCenter, DragEndEvent, SensorDescriptor, SensorOptions } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TierRow } from './TierPricingRow';

interface TierPricingListProps {
    items: AppTier[];
    sensors: SensorDescriptor<SensorOptions>[];
    onDragEnd: (event: DragEndEvent) => void;
    onDelete: (slug: string, name: string) => void;
}

export const TierPricingList = ({ items, sensors, onDragEnd, onDelete }: TierPricingListProps) => {
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
