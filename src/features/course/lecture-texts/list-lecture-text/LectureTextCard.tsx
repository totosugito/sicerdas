import React from "react";
import { LectureTextItem } from "@/api/course/lecture-texts";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Eye, Edit, Trash2, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { CourseStatusBadge } from "@/features/components";

import { Badge } from "@/components/ui/badge";

interface LectureTextCardProps {
  article: LectureTextItem;
  onPreview: (article: LectureTextItem) => void;
  onDelete: (article: LectureTextItem) => void;
}

export function LectureTextCard({ article, onPreview, onDelete }: LectureTextCardProps) {
  const { t } = useAppTranslation();

  const blocksCount = article.content?.length || 0;

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card/80 transition-all duration-300 hover:border-primary/40 hover:shadow-md">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <FileText className="h-5 w-5" />
            </div>
            <div className="space-y-1 overflow-hidden">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-base leading-tight tracking-tight truncate group-hover:text-primary transition-colors">
                  {article.title || t(($) => $.course.lectureTexts.unnamedArticle)}
                </h4>
                {article.status && (
                  <CourseStatusBadge status={article.status} />
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span>{blocksCount} {t(($) => $.course.lectureTexts.blocksCount)}</span>
              </p>
              {(article.category?.name || article.grade?.name) && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {article.category?.name && (
                    <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0.5 rounded-md">
                      {article.category.name}
                    </Badge>
                  )}
                  {article.grade?.name && (
                    <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5 rounded-md">
                      {article.grade.name}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-2 text-xs text-muted-foreground space-y-2">
        <div className="flex items-center justify-between border-t border-border/40 pt-3 text-[11px]">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {article.createdAt ? format(new Date(article.createdAt), "dd MMM yyyy") : "-"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.updatedAt ? format(new Date(article.updatedAt), "HH:mm") : "-"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-2 bg-muted/20 border-t border-border/40 flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPreview(article)}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Eye className="h-3.5 w-3.5" />
          {t(($) => $.labels.preview)}
        </Button>

        <div className="flex items-center gap-1">
          <Link to={AppRoute.course.lectureTexts.admin.edit.url.replace("$id", article.id)}>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(article)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
