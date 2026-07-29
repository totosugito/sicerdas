import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectPositioner } from "@/components/ui/select";
import { Search, Loader2, BookOpen, GraduationCap, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useListLectureTextSimple, useDetailLectureText } from "@/api/course/lecture-texts";
import { useListPackageSimple } from "@/api/exam/packages/admin/list-package-simple";
import { useListPackageSectionSimple } from "@/api/exam/package-sections/admin/list-section-simple";
import { useListCategorySimple } from "@/api/education/categories/list-category-simple";
import { useListGradeSimple } from "@/api/education/grades/list-grade-simple";
import { Badge } from "@/components/ui/badge";
import { EnumContentStatus } from "@/api/types";

export type DialogAssetPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "text" | "exam";
  onSelect: (selected: { id: string; title: string; packageId?: string }) => void;
};

// Text Article Preview Component
const ArticlePreview = ({ id }: { id: string }) => {
  const { t } = useAppTranslation();
  const { data: detailData, isLoading } = useDetailLectureText(id);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const article = detailData?.data;
  if (!article) {
    return (
      <div className="text-center p-6 text-muted-foreground text-sm">
        {t(($) => $.course.lectures.picker.articleError)}
      </div>
    );
  }

  // Render simplified block contents
  const blocks = Array.isArray(article.content) ? article.content : [];

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-base text-foreground leading-snug">{article.title}</h4>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {article.category?.name && (
            <Badge variant="secondary" className="text-[10px]">
              {article.category.name}
            </Badge>
          )}
          {article.grade?.grade && (
            <Badge variant="outline" className="text-[10px]">
              {article.grade.grade}
            </Badge>
          )}
        </div>
      </div>
      <div className="h-px bg-border/60" />
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 text-sm text-muted-foreground leading-relaxed">
        {blocks.length === 0 ? (
          <p className="italic text-xs">{t(($) => $.course.lectures.picker.articleEmpty)}</p>
        ) : (
          blocks.map((block: any, idx: number) => {
            const blockType = block.type || "paragraph";
            const contentArray = Array.isArray(block.content) ? block.content : [];
            const textContent = contentArray.map((c: any) => c.text || "").join("");

            if (!textContent.trim()) return null;

            switch (blockType) {
              case "heading":
                const level = block.props?.level || 2;
                if (level === 1) return <h1 key={idx} className="text-lg font-bold text-foreground mt-4">{textContent}</h1>;
                if (level === 2) return <h2 key={idx} className="text-md font-bold text-foreground mt-3">{textContent}</h2>;
                return <h3 key={idx} className="text-sm font-bold text-foreground mt-2">{textContent}</h3>;
              case "bulletListItem":
                return (
                  <ul key={idx} className="list-disc pl-5 space-y-1">
                    <li>{textContent}</li>
                  </ul>
                );
              case "numberedListItem":
                return (
                  <ol key={idx} className="list-decimal pl-5 space-y-1">
                    <li>{textContent}</li>
                  </ol>
                );
              default:
                return <p key={idx} className="text-xs sm:text-sm">{textContent}</p>;
            }
          })
        )}
      </div>
    </div>
  );
};

// Exam Section Preview Component
const SectionPreview = ({ id }: { id: string }) => {
  const { t } = useAppTranslation();
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-bold text-base text-foreground leading-snug">
          {t(($) => $.course.lectures.picker.sectionDetailTitle)}
        </h4>
      </div>
      <div className="h-px bg-border/60" />
      <div className="space-y-3 text-sm text-muted-foreground">
        <p className="italic text-xs">{t(($) => $.course.lectures.picker.selectedSectionHint)}</p>
        <div className="grid grid-cols-2 gap-3 mt-4 bg-muted/30 p-3 rounded-lg border border-border/40">
          <div>
            <span className="text-[10px] uppercase tracking-wider block font-semibold text-muted-foreground">ID Seksi</span>
            <span className="text-xs text-foreground font-mono truncate block max-w-full">{id}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider block font-semibold text-muted-foreground">Sistem</span>
            <span className="text-xs text-foreground block">{t(($) => $.course.lectures.picker.sectionSystem)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exam Package Sections Sub-list Component
const PackageSectionsList = ({
  packageId,
  selectedSectionId,
  onSelectSection,
}: {
  packageId: string;
  selectedSectionId: string | null;
  onSelectSection: (section: { id: string; title: string }) => void;
}) => {
  const { t } = useAppTranslation();
  const { data: sectionData, isLoading } = useListPackageSectionSimple({
    packageId,
    limit: 100,
  });

  if (isLoading) {
    return (
      <div className="pl-8 py-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>{t(($) => $.course.lectures.picker.loadingSections)}</span>
      </div>
    );
  }

  const sections = sectionData?.data?.items || [];

  if (sections.length === 0) {
    return (
      <div className="pl-8 py-2 text-xs text-muted-foreground italic">
        {t(($) => $.course.lectures.picker.noSections)}
      </div>
    );
  }

  return (
    <div className="pl-7 pr-2 py-1.5 flex flex-col gap-1 border-l border-border/60 ml-5 mt-1 space-y-0.5">
      {sections.map((section) => {
        const isSelected = selectedSectionId === section.value;
        return (
          <button
            key={section.value}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectSection({ id: section.value, title: section.label });
            }}
            className={`w-full flex items-center justify-between text-left p-2 rounded-lg text-xs transition-all ${
              isSelected
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium"
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate max-w-[200px]">{section.label}</span>
            </div>
            {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
};

export function DialogAssetPicker({ open, onOpenChange, type, onSelect }: DialogAssetPickerProps) {
  const { t } = useAppTranslation();

  // Search & filter states
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [educationGradeId, setEducationGradeId] = useState("");

  // Expanded package state (for EXAM mode)
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);

  // Selected item tracking
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    title: string;
    packageId?: string;
  } | null>(null);

  // Load category and grade list options
  const { data: categoryData } = useListCategorySimple({ limit: 100 }, { enabled: open });
  const { data: gradeData } = useListGradeSimple({ limit: 100 }, { enabled: open });

  // Query Text Articles (Simple)
  const { data: textData, isLoading: isTextLoading } = useListLectureTextSimple(
    {
      search: search || undefined,
      categoryId: categoryId || undefined,
      educationGradeId: educationGradeId ? Number(educationGradeId) : undefined,
      status: EnumContentStatus.PUBLISHED,
      limit: 100,
    },
    { enabled: open && type === "text" }
  );

  // Query Exam Packages (Simple)
  const { data: packageData, isLoading: isPackageLoading } = useListPackageSimple(
    {
      search: search || undefined,
      limit: 100,
    },
    { enabled: open && type === "exam" }
  );

  const categories = categoryData?.data?.items || [];
  const grades = gradeData?.data?.items || [];

  const handleConfirm = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[85vw] md:max-w-[80vw] lg:max-w-[900px] flex flex-col h-[85vh] max-h-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>
            {type === "text"
              ? t(($) => $.course.lectures.picker.textTitle)
              : t(($) => $.course.lectures.picker.examTitle)}
          </DialogTitle>
          <DialogDescription>
            {type === "text"
              ? t(($) => $.course.lectures.picker.textDescription)
              : t(($) => $.course.lectures.picker.examDescription)}
          </DialogDescription>
        </DialogHeader>

        {/* Filter Bar */}
        <div className="px-6 py-3 bg-muted/20 border-b grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(($) => $.course.lectures.picker.searchPlaceholder)}
              className="pl-8 h-9 text-xs"
            />
          </div>

          <Select value={categoryId || "all"} onValueChange={(val) => setCategoryId(val === "all" || !val ? "" : val)}>
            <SelectTrigger className="h-9 text-xs bg-transparent">
              <SelectValue placeholder={t(($) => $.course.lectures.picker.allCategories)} />
            </SelectTrigger>
            <SelectPositioner>
              <SelectContent>
                <SelectItem value="all">{t(($) => $.course.lectures.picker.allCategories)}</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>

          <Select value={educationGradeId || "all"} onValueChange={(val) => setEducationGradeId(val === "all" || !val ? "" : val)}>
            <SelectTrigger className="h-9 text-xs bg-transparent">
              <SelectValue placeholder={t(($) => $.course.lectures.picker.allGrades)} />
            </SelectTrigger>
            <SelectPositioner>
              <SelectContent>
                <SelectItem value="all">{t(($) => $.course.lectures.picker.allGrades)}</SelectItem>
                {grades.map((g) => (
                  <SelectItem key={g.value} value={g.value}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>
        </div>

        {/* Workspace Body: Split Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left List Pane (60%) */}
          <div className="w-[60%] border-r overflow-y-auto p-4 flex flex-col gap-2 bg-card">
            {type === "text" ? (
              isTextLoading ? (
                <div className="flex h-full items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (textData?.data?.items || []).length === 0 ? (
                <div className="text-center p-6 text-muted-foreground text-xs italic">
                  {t(($) => $.course.lectures.picker.noArticles)}
                </div>
              ) : (
                (textData?.data?.items || []).map((item) => {
                  const isSelected = selectedItem?.id === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setSelectedItem({
                          id: item.value,
                          title: item.label,
                        })
                      }
                      className={`w-full flex items-center justify-between text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-primary/5 border-primary text-primary font-medium"
                          : "hover:bg-muted/50 border-border/40 text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-xs sm:text-sm">{item.label}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0" />}
                    </button>
                  );
                })
              )
            ) : isPackageLoading ? (
              <div className="flex h-full items-center justify-center p-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (packageData?.data?.items || []).length === 0 ? (
              <div className="text-center p-6 text-muted-foreground text-xs italic">
                {t(($) => $.course.lectures.picker.noPackages)}
              </div>
            ) : (
              (packageData?.data?.items || []).map((item) => {
                const isExpanded = expandedPackageId === item.value;
                return (
                  <div
                    key={item.value}
                    className={`flex flex-col rounded-xl border border-border/40 bg-card overflow-hidden transition-all`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedPackageId(isExpanded ? null : item.value)}
                      className={`w-full flex items-center justify-between text-left p-3 hover:bg-muted/40 transition-colors ${
                        isExpanded ? "border-b border-border/40" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate text-xs sm:text-sm font-medium">{item.label}</span>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <PackageSectionsList
                        packageId={item.value}
                        selectedSectionId={selectedItem?.id || null}
                        onSelectSection={(section) =>
                          setSelectedItem({
                            id: section.id,
                            title: section.title,
                            packageId: item.value,
                          })
                        }
                      />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Preview Pane (40%) */}
          <div className="w-[40%] bg-muted/10 overflow-y-auto p-5">
            {!selectedItem ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground gap-2">
                <FileText className="h-8 w-8 text-muted-foreground/40" />
                <span className="text-xs">
                  {t(($) => $.course.lectures.picker.previewPlaceholder)}
                </span>
              </div>
            ) : type === "text" ? (
              <ArticlePreview id={selectedItem.id} />
            ) : (
              <SectionPreview id={selectedItem.id} />
            )}
          </div>
        </div>

        <DialogFooter className="p-6 border-t bg-card shrink-0">
          <div className="flex gap-2 justify-end w-full">
            <Button variant="outline" size="sm" type="button" onClick={() => onOpenChange(false)}>
              {t(($) => $.course.lectures.picker.btnCancel)}
            </Button>
            <Button
              size="sm"
              type="button"
              disabled={!selectedItem}
              onClick={handleConfirm}
              className="bg-primary hover:bg-primary/95 text-primary-foreground font-medium"
            >
              {t(($) => $.course.lectures.picker.btnConfirm)}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
