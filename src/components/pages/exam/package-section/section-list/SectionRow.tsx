import { GripVertical, Edit2, Trash2, Clock, Check, FileQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExamPackageSection } from "@/api/exam-package-sections";
import { useTranslation } from "react-i18next";

interface SectionRowProps {
    section: ExamPackageSection;
    onDelete: (id: string, title: string) => void;
    onEdit: (section: ExamPackageSection) => void;
}

export const SectionRow = ({ section, onDelete, onEdit }: SectionRowProps) => {
    const { t } = useTranslation();

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
            {/* Top row: drag handle, title, questions, status, actions */}
            <div className="flex items-center gap-3">
                <button
                    {...attributes}
                    {...listeners}
                    className="flex-shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none p-1 rounded hover:bg-secondary"
                >
                    <GripVertical className="w-5 h-5" />
                </button>

                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="font-semibold leading-tight inline-block">
                            {section.title}
                        </h3>
                    </div>
                </div>

                <div className="mt-2 ml-[52px] flex items-center gap-4 text-xs text-muted-foreground md:mt-0 md:ml-0">
                    {section.durationMinutes ? (
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {t('exam.packageSection.list.sections.duration', { minutes: section.durationMinutes })}
                        </span>
                    ) : null}
                    <span className="flex items-center gap-1">
                        <FileQuestion className="w-3.5 h-3.5" />
                        {t('exam.packageSection.list.sections.questions', { count: section.totalQuestions })}
                    </span>
                </div>

                <Badge
                    variant={section.isActive ? "default" : "secondary"}
                    className={
                        section.isActive
                            ? "flex-shrink-0 bg-primary/15 text-primary border-0 hover:bg-primary/20 text-xs hidden md:flex"
                            : "flex-shrink-0 text-xs hidden md:flex"
                    }
                >
                    {section.isActive ? t('exam.packageSection.list.sections.active') : t('exam.packageSection.list.sections.inactive')}
                </Badge>

                <div className="flex-shrink-0 flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(section)}>
                        <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(section.id, section.title)}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Mobile version Status badge rendering */}
            <div className="md:hidden mt-2 ml-[52px]">
                <Badge
                    variant={section.isActive ? "default" : "secondary"}
                    className={
                        section.isActive
                            ? "flex-shrink-0 bg-primary/15 text-primary border-0 hover:bg-primary/20 text-xs"
                            : "flex-shrink-0 text-xs"
                    }
                >
                    {section.isActive ? t('exam.packageSection.list.sections.active') : t('exam.packageSection.list.sections.inactive')}
                </Badge>
            </div>
        </div>
    );
};
