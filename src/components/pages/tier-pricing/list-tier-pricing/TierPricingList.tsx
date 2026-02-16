import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/my-utils';
import { Link } from '@tanstack/react-router';
import { TierPricing } from '@/api/tier-pricing';
import { DndContext, closestCenter, DragEndEvent, SensorDescriptor, SensorOptions } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// Sortable Item Component
function SortableItem({ item, onDelete }: { item: TierPricing; onDelete: (slug: string) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.slug });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="flex items-center justify-between p-4 mb-2 bg-card select-none"
        >
            <div className="flex items-center gap-4">
                <div {...attributes} {...listeners} className="cursor-grab hover:text-primary p-2">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <div className="font-semibold text-lg">{item.name}</div>
                    <div className="text-sm text-muted-foreground flex gap-2">
                        <span>{item.slug}</span>
                        <span>•</span>
                        <span>{formatCurrency(Number(item.price), item.currency)} / {item.billingCycle}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Badge variant={item.isActive ? "default" : "secondary"}>
                    {item.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <div className="text-sm font-medium text-muted-foreground w-8 text-center bg-muted rounded p-1">
                    #{item.sortOrder}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                        <Link to="/admin/tier-pricing/$slug" params={{ slug: item.slug }}>
                            <Pencil className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => onDelete(item.slug)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}

interface TierPricingListProps {
    items: TierPricing[];
    sensors: SensorDescriptor<SensorOptions>[];
    onDragEnd: (event: DragEndEvent) => void;
    onDelete: (slug: string) => void;
}


export const TierPricingList = ({ items, sensors, onDragEnd, onDelete }: TierPricingListProps) => {
    return (
        <div className="max-w-4xl mx-auto">
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
                        <SortableItem key={item.slug} item={item} onDelete={onDelete} />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
};
