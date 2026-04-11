import React from "react";
import { ExamPackage } from "@/api/exam-packages";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Layers,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ImageIcon,
  CalendarDays,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { string_to_locale_date } from "@/lib/my-utils";
import { cn } from "@/lib/utils";

interface PackageCardListItemProps {
  pkg: ExamPackage;
  onDelete: (pkg: ExamPackage) => void;
}

export function PackageCardListItem({ pkg, onDelete }: PackageCardListItemProps) {
  const { t } = useAppTranslation();
  const [hasError, setHasError] = React.useState(false);

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm flex flex-col h-full py-0">
      {/* Thumbnail Area */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {pkg.thumbnail && !hasError ? (
          <img
            src={pkg.thumbnail}
            alt={pkg.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 bg-gradient-to-br from-muted to-muted/30">
            <ImageIcon className="h-12 w-12" />
          </div>
        )}

        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge
            variant={pkg.isActive ? "success" : "secondary"}
            className="shadow-lg backdrop-blur-md"
          >
            {pkg.isActive
              ? t(($) => $.exam.packages.table.status.active)
              : t(($) => $.exam.packages.table.status.inactive)}
          </Badge>
        </div>

        {pkg.isNew && (
          <div className="absolute top-3 right-3 z-10">
            <span className="new-badge animate-pulse">{t(($) => $.labels.new)}</span>
          </div>
        )}

        {/* Action Overlay for hover (Quick Edit/View) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="icon" variant="secondary" className="rounded-full h-9 w-9" asChild>
            <Link to={AppRoute.exam.packages.admin.detail.url.replace("$id", pkg.id)}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="icon" variant="secondary" className="rounded-full h-9 w-9" asChild>
            <Link to={AppRoute.exam.packages.admin.edit.url.replace("$id", pkg.id)}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <CardContent className="p-4 flex flex-col flex-1 space-y-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                {pkg.categoryName || t(($) => $.exam.packages.form.preview.categoryPlaceholder)}
              </span>
              <h3 className="font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {pkg.title}
              </h3>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {t(($) => $.exam.packages.table.columns.actions)}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={AppRoute.exam.packages.admin.detail.url.replace("$id", pkg.id)}>
                    <Eye className="mr-2 h-4 w-4" />{" "}
                    {t(($) => $.exam.packages.table.actions.detail)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={AppRoute.exam.packages.admin.edit.url.replace("$id", pkg.id)}>
                    <Pencil className="mr-2 h-4 w-4" />{" "}
                    {t(($) => $.exam.packages.table.actions.edit)}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(pkg)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />{" "}
                  {t(($) => $.exam.packages.table.actions.delete)}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-xs text-muted-foreground italic line-clamp-1">
            {pkg.educationGradeName || "-"}
          </p>
        </div>

        <div className="pt-3 border-t border-border/40 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
            <Layers className="h-3.5 w-3.5 text-primary" />
            <span>
              {pkg.totalSections || 0} {t(($) => $.exam.packages.table.columns.sections)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>
              {pkg.durationMinutes || 0} {t(($) => $.exam.packages.table.columns.duration)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium col-span-2">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span>{string_to_locale_date("id-ID", pkg.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
