import {
    DndContext,
    closestCenter,
    DragEndEvent,
    SensorDescriptor,
    SensorOptions,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SolutionRow } from "./SolutionRow";
import { ExamQuestionSolution } from "@/api/exam-question-solutions";

interface SolutionListProps {
    items: ExamQuestionSolution[];
    sensors: SensorDescriptor<SensorOptions>[];
    onDragEnd: (event: DragEndEvent) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
}

export const SolutionList = ({
    items,
    sensors,
    onDragEnd,
    onDelete,
    onEdit,
}: SolutionListProps) => {
    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
        >
            <SortableContext
                items={items.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex flex-col gap-4">
                    {items.map((item, index) => (
                        <SolutionRow
                            key={item.id}
                            solution={item}
                            index={index}
                            onDelete={onDelete}
                            onEdit={onEdit}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};
