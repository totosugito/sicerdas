import { createFileRoute, Link } from "@tanstack/react-router";
import { useSessionDetails } from "@/api/exam-sessions";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trophy,
  Clock,
  ArrowLeft,
  RotateCcw,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AppRoute } from "@/constants/app-route";
import { useState, useMemo } from "react";
import { useSessionQuestion } from "@/api/exam-sessions";
import { LayoutGrid, List as ListIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/(pages)/exam/session/$id/results")({
  component: SessionResultsComponent,
});

function SessionResultsComponent() {
  const { id: sessionId } = Route.useParams();
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: detailsRes, isLoading } = useSessionDetails(sessionId);
  const details = detailsRes?.data;

  const getSnippet = (content: any[] | null) => {
    if (!content || !Array.isArray(content)) return "";
    // Extract text from BlockNote JSON structure
    return (
      content
        .map((block) => {
          if (block.content && Array.isArray(block.content)) {
            return block.content.map((c: any) => c.text || "").join("");
          }
          return "";
        })
        .join(" ")
        .substring(0, 150) + "..."
    );
  };

  const filteredGrid = useMemo(() => {
    const grid = details?.grid || [];
    if (!searchQuery) return grid;
    return grid.filter((item) => {
      const snippet = getSnippet(item.questionContent).toLowerCase();
      return (
        snippet.includes(searchQuery.toLowerCase()) || item.order.toString().includes(searchQuery)
      );
    });
  }, [details?.grid, searchQuery]);

  if (isLoading || !details) {
    return (
      <div className="flex h-screen items-center justify-center animate-pulse text-muted-foreground font-semibold">
        Memuat Hasil...
      </div>
    );
  }

  const { session, grid } = details;
  const totalQuestions = grid.length;
  const correctCount = grid.filter((q) => q.isCorrect === true).length;
  const wrongCount = grid.filter((q) => q.isCorrect === false).length;
  const skippedCount = grid.filter((q) => q.isCorrect === null && !q.isAnswered).length;

  const score = session.score ?? 0;
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary/5 border-b border-primary/10 py-8 md:py-12 px-4 mb-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-in zoom-in duration-500">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-2">
            Hasil Ujian
          </h1>
          <p className="text-muted-foreground max-w-md">
            Selamat! Anda telah menyelesaikan sesi ini. Berikut adalah ringkasan performa Anda.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4">
          <Link to={AppRoute.exam.exams.url} className="flex-1">
            <Button
              variant="outline"
              className="w-full h-12 gap-2 font-bold rounded-xl border-primary/20 hover:bg-primary/5"
            >
              <ArrowLeft className="w-4 h-4" />
              Daftar Ujian
            </Button>
          </Link>
          <Link to={AppRoute.exam.session.url} params={{ id: sessionId }} className="flex-1">
            <Button
              variant="secondary"
              className="w-full h-12 gap-2 font-bold rounded-xl border-border hover:bg-muted"
            >
              <Monitor className="w-4 h-4" />
              Engine Ujian
            </Button>
          </Link>
          <Link to={AppRoute.exam.exams.url} className="flex-1">
            <Button className="w-full h-12 gap-2 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <RotateCcw className="w-4 h-4" />
              Ujian Baru
            </Button>
          </Link>
        </div>

        {/* Main Score Card */}
        <Card className="overflow-hidden border-2 border-primary/20 shadow-xl shadow-primary/5">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 p-8 bg-primary/5 flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-primary/10">
                <span className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-1">
                  Skor Akhir
                </span>
                <div className="text-7xl font-black text-primary mb-2">{Math.round(score)}</div>
                <div className="text-sm font-medium text-muted-foreground">Skala 0 - 100</div>
              </div>
              <div className="flex-[1.5] p-8 grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Benar
                  </div>
                  <div className="text-2xl font-bold">{correctCount}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <XCircle className="w-4 h-4 text-red-500" />
                    Salah
                  </div>
                  <div className="text-2xl font-bold">{wrongCount}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <HelpCircle className="w-4 h-4 text-orange-500" />
                    Dilewati
                  </div>
                  <div className="text-2xl font-bold">{skippedCount}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <Clock className="w-4 h-4 text-blue-500" />
                    Waktu
                  </div>
                  <div className="text-2xl font-bold">{formatTime(session.elapsedSeconds)}</div>
                </div>
              </div>
            </div>
            <div className="px-8 py-4 bg-muted/30 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Akurasi</span>
                <span className="text-sm font-bold">{Math.round(accuracy)}%</span>
              </div>
              <Progress value={accuracy} className="h-2 bg-muted" />
            </div>
          </CardContent>
        </Card>

        {/* Question Grid / List Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-2xl font-black flex items-center gap-2">
              Tinjauan Soal
              <span className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {totalQuestions} Soal
              </span>
            </h2>

            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border self-start md:self-auto">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="rounded-lg h-9 gap-2"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="rounded-lg h-9 gap-2"
                onClick={() => setViewMode("list")}
              >
                <ListIcon className="w-4 h-4" />
                List
              </Button>
            </div>
          </div>

          {viewMode === "list" && (
            <div className="relative animate-in fade-in slide-in-from-top-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari kata kunci soal atau nomor..."
                className="pl-10 h-11 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {viewMode === "grid" ? (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 md:gap-3 animate-in fade-in duration-500">
              {grid.map((item) => (
                <button
                  key={item.questionId}
                  onClick={() => {
                    setSelectedReviewId(item.questionId);
                    setTimeout(() => {
                      document
                        .getElementById("review-section")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 100);
                  }}
                  className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all duration-200 hover:scale-105 active:scale-95 ${
                    item.isCorrect === true
                      ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 shadow-sm shadow-green-500/10"
                      : item.isCorrect === false
                        ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 shadow-sm shadow-green-500/10"
                        : "bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {item.order}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-500">
              {filteredGrid.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                  Tidak ada soal yang sesuai dengan pencarian Anda.
                </div>
              ) : (
                filteredGrid.map((item) => (
                  <div
                    key={item.questionId}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedReviewId(item.questionId);
                      setTimeout(() => {
                        document
                          .getElementById("review-section")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setSelectedReviewId(item.questionId);
                        setTimeout(() => {
                          document
                            .getElementById("review-section")
                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }, 100);
                      }
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer hover:bg-muted/30 group ${
                      selectedReviewId === item.questionId
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/20"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg ${
                        item.isCorrect === true
                          ? "bg-green-500 text-white"
                          : item.isCorrect === false
                            ? "bg-red-500 text-white"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed">
                        {getSnippet(item.questionContent)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 rounded-lg text-xs font-bold"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Question Review Section (Inline) */}
        {selectedReviewId && (
          <div
            id="review-section"
            className="pt-8 animate-in fade-in slide-in-from-bottom-8 duration-700"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <div className="w-2 h-8 bg-primary rounded-full" />
                Detail Review Soal
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedReviewId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                Tutup Review
              </Button>
            </div>
            <QuestionReviewSection
              sessionId={sessionId}
              questionId={selectedReviewId}
              grid={grid}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionReviewSection({
  sessionId,
  questionId,
  grid,
}: {
  sessionId: string;
  questionId: string;
  grid: any[];
}) {
  const { data: questionRes, isLoading } = useSessionQuestion(sessionId, questionId);
  const qData = questionRes?.data;
  const item = grid.find((g) => g.questionId === questionId);

  if (isLoading) {
    return (
      <Card className="border-2 border-dashed animate-pulse">
        <CardContent className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="font-bold">Memuat detail pembahasan...</p>
        </CardContent>
      </Card>
    );
  }

  if (!qData) return null;

  return (
    <div className="space-y-8 pb-20">
      <Card className="overflow-hidden border-2 shadow-lg">
        <CardHeader className="bg-muted/30 border-b py-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-black">
              {item?.order}
            </span>
            Informasi Soal
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 md:p-10 space-y-8">
          {/* Passage if any */}
          {qData.passage && (
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 text-base leading-relaxed">
              <div className="font-black mb-4 text-xs uppercase tracking-widest text-primary/60">
                Bacaan Pendukung
              </div>
              <div
                className="prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: qData.passage.htmlContent }}
              />
            </div>
          )}

          {/* Question Content */}
          <div
            className="text-xl md:text-2xl font-bold leading-snug tracking-tight text-foreground"
            dangerouslySetInnerHTML={{ __html: qData.question.htmlContent }}
          />

          {/* Options */}
          <div className="grid gap-4">
            {qData.options.map((option, idx) => {
              const letter = ["A", "B", "C", "D", "E"][idx];
              const isCorrect = qData.evaluation?.correctOptionId === option.id;
              const isSelected = qData.selectedOptionId === option.id;

              let borderStyle = "border-border";
              let bgStyle = "bg-card";
              let icon = null;

              if (isCorrect) {
                borderStyle = "border-green-500 shadow-md shadow-green-500/10";
                bgStyle = "bg-green-500/5";
                icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
              } else if (isSelected && !isCorrect) {
                borderStyle = "border-red-500 shadow-md shadow-red-500/10";
                bgStyle = "bg-red-500/5";
                icon = <XCircle className="w-5 h-5 text-red-500" />;
              }

              return (
                <div
                  key={option.id}
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${borderStyle} ${bgStyle}`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg ${
                      isCorrect
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                        : isSelected
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {letter}
                  </div>
                  <div
                    className="flex-1 pt-1.5 leading-relaxed text-[17px] font-medium"
                    dangerouslySetInnerHTML={{ __html: option.htmlContent }}
                  />
                  {icon}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Solutions */}
      {qData.evaluation?.solutions && qData.evaluation.solutions.length > 0 && (
        <div className="space-y-6">
          {qData.evaluation.solutions.map((sol) => (
            <Card
              key={sol.id}
              className="border-2 border-primary/20 shadow-xl shadow-primary/5 overflow-hidden"
            >
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-3 text-primary text-xl font-black">
                  <Trophy className="w-6 h-6" />
                  {sol.title || "Pembahasan Solusi"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 md:p-10">
                <div
                  className="prose prose-blue dark:prose-invert max-w-none text-muted-foreground leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ __html: sol.htmlContent }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
