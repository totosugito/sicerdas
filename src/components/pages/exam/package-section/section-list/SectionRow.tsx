import { GripVertical, Edit2, Trash2, Clock, FileQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExamPackageSection } from "@/api/exam-package-sections";
import { useAppTranslation } from "@/lib/i18n-typed";

interface SectionRowProps {
    section: ExamPackageSection;
    onDelete: (id: string, title: string) => void;
    onEdit: (section: ExamPackageSection) => void;
}

export const SectionRow = ({ section, onDelete, onEdit }: SectionRowProps) => {
    const { t } = useAppTranslation();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative rounded-xl border bg-card p-4 transition-all mb-4 ${isDragging
                ? "shadow-lg opacity-90 z-10 border-primary"
                : "hover:border-primary/30 hover:shadow-sm"
                }`}
        >
            <div className="flex items-start gap-4">
                {/* Left Column: Sequence Controls */}
                <div className="flex flex-col items-center gap-2">
                    <button
                        {...attributes}
                        {...listeners}
                        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1 rounded hover:bg-secondary"
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary/50 border border-border/50 text-[11px] font-black text-muted-foreground/80 shrink-0 group-hover:border-primary/30 group-hover:text-primary transition-colors shadow-sm">
                        {section.order}
                    </div>
                </div>

                {/* Main Content Column */}
                <div className="flex-1 min-w-0 pt-0.5 space-y-2">
                    <h3 className="font-bold text-base tracking-tight truncate">
                        {section.title}
                    </h3>

                    {/* Info row: duration and questions */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {section.durationMinutes ? (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {t($ => $.exam.packageSection.list.sections.duration, { minutes: section.durationMinutes })}
                            </span>
                        ) : null}
                        <span className="flex items-center gap-1">
                            <FileQuestion className="w-3.5 h-3.5" />
                            {t($ => $.exam.packageSection.list.sections.questions, { count: section.totalQuestions })}
                        </span>
                    </div>
                </div>

                {/* Status Badge and Actions */}
                <div className="flex-shrink-0 flex items-center gap-3">
                    <Badge
                        variant={section.isActive ? "default" : "secondary"}
                        className={
                            section.isActive
                                ? "bg-primary/10 text-primary border-0 hover:bg-primary/20 text-xs px-2"
                                : "text-xs px-2"
                        }
                    >
                        {section.isActive ? t($ => $.exam.packageSection.list.sections.active) : t($ => $.exam.packageSection.list.sections.inactive)}
                    </Badge>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(section)}>
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(section.id, section.title)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
