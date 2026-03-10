import { GripVertical, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppTranslation } from "@/lib/i18n-typed";
import { ExamQuestion } from "@/api/exam-questions";
import { blocknote_to_text } from "@/lib/blocknote-utils";
import { LongText } from "@/components/custom/components";

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

    const plainText = blocknote_to_text(option.content);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative border rounded-xl p-5 transition-all ${isDragging
                ? "shadow-lg opacity-90 z-50 border-primary bg-card"
                : option.isCorrect
                    ? "border-[#22c55e]/50 bg-card hover:bg-[#22c55e]/[0.02] dark:hover:bg-[#22c55e]/[0.05] shadow-sm shadow-[#22c55e]/5"
                    : "border-border bg-card hover:bg-accent/5 dark:hover:bg-accent/10 shadow-sm"
                }`}
        >
            <div className="absolute -left-3 top-3 flex flex-col items-center gap-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-background transition-colors ${option.isCorrect
                    ? "bg-[#22c55e] text-white dark:bg-[#22c55e]/80 dark:text-white"
                    : "bg-primary text-primary-foreground dark:bg-primary/80 dark:text-white"
                    }`}>
                    {getOptionLabel(index)}
                </div>
                <button
                    {...attributes}
                    {...listeners}
                    className="ml-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary touch-none p-1 rounded-md hover:bg-primary/10 transition-colors"
                >
                    <GripVertical className="w-4 h-4" />
                </button>
            </div>

            <div className="flex justify-between items-start mb-0 ml-6">
                <div className="w-full text-sm text-foreground/80 dark:text-foreground/90 min-h-[40px] flex items-center">
                    {plainText ? (
                        <LongText text={plainText} maxChars={200} />
                    ) : (
                        <span className="text-muted-foreground italic">
                            {t($ => $.exam.options.noContent)}
                        </span>
                    )}
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                    {option.isCorrect ? (
                        <Badge variant="outline" className="h-7 text-[#22c55e] border-[#22c55e]/50 border-dashed bg-[#22c55e]/[0.03] dark:bg-[#22c55e]/[0.1] dark:border-[#22c55e]/60">
                            {t($ => $.exam.options.correct)}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="h-7 text-muted-foreground border-dashed bg-transparent opacity-60 dark:opacity-80">
                            {t($ => $.exam.options.incorrect)}
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
