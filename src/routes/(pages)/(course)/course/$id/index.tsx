import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDetailCourseClient, useCourseStructureClient } from "@/api/course/courses";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageTitle, ErrorContainer } from "@/components/general";
import { ImageIcon, Layers, BookOpen, Clock, Star, ShieldCheck, ChevronRight, PlayCircle, FileText, CheckCircle2 } from "lucide-react";
import { AppRoute } from "@/constants/app-route";

export const Route = createFileRoute("/(pages)/(course)/course/$id")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { id } = Route.useParams();
  const { t } = useAppTranslation();
  const navigate = useNavigate();

  const { data: detailData, isLoading: isDetailLoading, isError: isDetailError, error: detailError } = useDetailCourseClient(id);
  const course = detailData?.data;

  const { data: structureData, isLoading: isStructureLoading } = useCourseStructureClient(id);
  const chapters = structureData?.data || [];

  if (isDetailError) {
    return (
      <div className="flex flex-col w-full space-y-4 container mx-auto p-4 md:p-6">
        <ErrorContainer
          title={t(($) => $.labels.error)}
          message={detailError?.message || "Gagal memuat detail kursus"}
          buttonText={t(($) => $.labels.back)}
          onButtonClick={() => navigate({ to: AppRoute.course.courses.courses.url })}
        />
      </div>
    );
  }

  const isLoading = isDetailLoading;

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
      {/* Top Breadcrumb/Back area */}
      <div className="container mx-auto px-4 md:px-6 pt-6">
        <PageTitle
          title={course?.courseName || t(($) => $.course.public.detail.title)}
          description={course?.category?.name || t(($) => $.course.courses.table.columns.category)}
          showBack={true}
          backTo={AppRoute.course.courses.courses.url}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-12 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main details (Left Side) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Details Card */}
            <Card className="overflow-hidden border-border/40 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {course?.category?.name || t(($) => $.course.courses.table.columns.category)}
                  </Badge>
                  <Badge className="bg-primary/10 text-primary border-none text-xs font-semibold">
                    {course?.grade?.name || t(($) => $.course.courses.table.gradeFilter)}
                  </Badge>
                  {course?.price === 0 && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-xs font-bold">
                      {t(($) => $.course.public.detail.free)}
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight mb-4">
                  {course?.courseName}
                </h1>

                {course?.courseDescription && (
                  <div className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line mb-6">
                    {course.courseDescription}
                  </div>
                )}

                {/* Rating & Stats row */}
                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-slate-950 dark:text-white">
                      {Number(course?.averageRating || 5.0).toFixed(1)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">
                      ({course?.totalRatings || 0} {t(($) => $.labels.rating)})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Layers className="h-4 w-4" />
                    <span>{course?.totalChapters || 0} {t(($) => $.course.courses.table.cardLabels.chapters)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <BookOpen className="h-4 w-4" />
                    <span>{course?.totalLectures || 0} {t(($) => $.course.courses.table.cardLabels.lectures)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Syllabus Preview */}
            <Card className="border-border/40 shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  {t(($) => $.course.public.detail.syllabus)}
                </h2>

                {isStructureLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-12 bg-muted animate-pulse rounded-xl" />
                    ))}
                  </div>
                ) : chapters.length === 0 ? (
                  <div className="text-slate-400 dark:text-slate-500 italic text-center py-6 text-sm">
                    {t(($) => $.course.public.detail.emptySyllabus)}
                  </div>
                ) : (
                  <Accordion multiple className="w-full space-y-3">
                    {chapters.map((chapter, idx) => (
                      <AccordionItem
                        key={chapter.id}
                        value={chapter.id}
                        className="border border-slate-100 dark:border-slate-800 rounded-xl px-4 overflow-hidden bg-slate-50/30 dark:bg-slate-950/20"
                      >
                        <AccordionTrigger className="hover:no-underline py-4 text-left">
                          <div className="flex flex-col gap-1 pr-4">
                            <span className="text-xs text-primary font-bold uppercase tracking-wider">
                              {t(($) => $.course.public.detail.chapter)} {idx + 1}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {chapter.chapterName}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-1 space-y-2 border-t border-slate-100 dark:border-slate-850">
                          {chapter.lectures && chapter.lectures.length > 0 ? (
                            chapter.lectures.map((lecture, lIdx) => (
                              <div
                                key={lecture.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/40"
                              >
                                <div className="flex items-center gap-3">
                                  {lecture.type === "video" ? (
                                    <PlayCircle className="h-4.5 w-4.5 text-primary shrink-0" />
                                  ) : (
                                    <FileText className="h-4.5 w-4.5 text-blue-500 shrink-0" />
                                  )}
                                  <div className="flex flex-col">
                                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                                      {t(($) => $.course.public.detail.lecture)} {lIdx + 1} • {lecture.type.toUpperCase()}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                                      {lecture.title}
                                    </span>
                                  </div>
                                </div>
                                
                                <Badge variant="outline" className="text-[10px] font-medium text-slate-400">
                                  {t(($) => $.course.public.detail.locked)}
                                </Badge>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-slate-400 dark:text-slate-500 italic p-2">
                              {t(($) => $.course.public.detail.noChapterLectures)}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Card (Right Side) */}
          <div className="space-y-6">
            <Card className="overflow-hidden border-border/40 shadow-sm sticky top-6">
              {/* Media Thumbnail Container */}
              <div className="relative aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800">
                {course?.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.courseName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                    <ImageIcon className="h-12 w-12 text-primary/20" />
                  </div>
                )}
              </div>

              <CardContent className="p-6 space-y-6">
                <div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">
                    {t(($) => $.course.public.detail.pricing)}
                  </span>
                  <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {course?.price === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400">{t(($) => $.course.public.detail.free)}</span>
                    ) : (
                      `Rp ${course?.price?.toLocaleString("id-ID")}`
                    )}
                  </div>
                </div>

                <Button className="w-full py-6 font-bold text-base rounded-xl shadow-md gap-2">
                  <span>{t(($) => $.course.public.detail.enroll)}</span>
                  <ChevronRight className="h-5 w-5" />
                </Button>

                {/* Info Bullet points */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{t(($) => $.course.public.detail.bullet1)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{t(($) => $.course.public.detail.bullet2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{t(($) => $.course.public.detail.bullet3)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
