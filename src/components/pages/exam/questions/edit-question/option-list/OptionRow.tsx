import { GripVertical, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ExamQuestion } from "@/api/exam-questions";

interface OptionRowProps {
    option: NonNullable<ExamQuestion['options']>[number];
    index: number;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
}

export const OptionRow = ({ option, index, onDelete, onEdit }: OptionRowProps) => {
    const { t } = useAppTranslation();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: option.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const getOptionLabel = (idx: number) => {
        return String.fromCharCode(65 + idx); // A, B, C...
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative border border-border rounded-xl p-5 bg-card transition-all ${isDragging
                ? "shadow-lg opacity-90 z-50 border-primary"
                : "hover:bg-accent/5 shadow-sm"
                }`}
        >
            <div className="absolute -left-3 top-5 flex flex-col items-center gap-2 z-10">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg border-2 border-background">
                    {getOptionLabel(index)}
                </div>
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary touch-none p-1 rounded-md hover:bg-primary/10 transition-colors"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
            </div>

            <div className="flex justify-between items-start mb-0 ml-6">
                <div className="w-full text-sm text-foreground/80 min-h-[40px] flex items-center">
                    {option.content && Array.isArray(option.content) && option.content.length > 0
                        ? t($ => $.exam.questions.edit.options.contentPlaceholder)
                        : t($ => $.exam.questions.edit.options.noContent)}
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                    {option.isCorrect ? (
                        <Badge variant="success" className="h-7">
                            {t($ => $.exam.questions.edit.options.correct)}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="h-7 text-muted-foreground border-dashed">
                            {t($ => $.exam.questions.edit.options.incorrect)}
                        </Badge>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => onEdit(option.id)}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(option.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
