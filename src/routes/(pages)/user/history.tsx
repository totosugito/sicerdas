import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useAllSessionHistory } from "@/api/exam-sessions/history";
import { useAppTranslation } from "@/lib/i18n-typed";
import { RecentSessionsList } from "@/components/pages/user/dashboard";
import { DataTablePagination } from "@/components/custom/table";
import { History, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-route";
import { Link } from "@tanstack/react-router";
import { PageTitle } from "@/components/app";

const historySearchSchema = z.object({
  page: z.number().min(1).optional().catch(undefined),
  limit: z.number().min(1).max(50).optional().catch(undefined),
});

type HistorySearch = z.infer<typeof historySearchSchema>;

export const Route = createFileRoute("/(pages)/user/history")({
  validateSearch: (search) => historySearchSchema.parse(search),
  component: HistoryRouteComponent,
});

function HistoryRouteComponent() {
  const { t } = useAppTranslation();
  const { page = 1, limit = 10 } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: res, isLoading } = useAllSessionHistory({ page, limit });
  const history = res?.data;
  const items = history?.items || [];
  const meta = history?.meta;

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev: HistorySearch) => ({ ...prev, page: newPage }),
    });
  };

  const handlePageSizeChange = (newLimit: number) => {
    navigate({
      search: (prev: HistorySearch) => ({ ...prev, limit: newLimit, page: 1 }),
    });
  };

  return (
    <div className="page-container py-8 w-full">
      <div className="flex flex-col gap-8 w-full">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageTitle
            title={t(($) => $.exam.sessions.dashboard.charts.recentActivity)}
            description={t(($) => $.exam.sessions.dashboard.charts.recentActivityDesc)}
          />
          <Link to={AppRoute.exam.exams.url}>
            <Button variant="outline" className="rounded-full font-bold px-6 border-blue-200 text-blue-600 hover:bg-blue-50">
              <BookOpen className="w-4 h-4 mr-2" />
              Kerjakan Ujian Baru
            </Button>
          </Link>
        </div>

        {/* Content Section */}
        <div className="min-h-[400px]  w-full">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(limit)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : items.length < 0 ? (
            <div className="flex flex-col gap-4">
              <RecentSessionsList history={history!} isLoading={false} />

              {meta && meta.totalPages > 1 && (
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <DataTablePagination
                    pageIndex={meta.page - 1}
                    setPageIndex={(newIndex) => handlePageChange(newIndex + 1)}
                    pageSize={meta.limit}
                    setPageSize={handlePageSizeChange}
                    rowsCount={meta.total}
                    paginationData={{
                      page: meta.page,
                      limit: meta.limit,
                      total: meta.total,
                      totalPages: meta.totalPages,
                    }}
                    showPageSize={false}
                    showPageLabel={false}
                    onPaginationChange={(data) => handlePageChange(data.page)}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <History className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Belum Ada Aktivitas
              </h3>
              <p className="text-slate-500 max-w-sm text-center mb-8">
                Kamu belum mengerjakan ujian apapun. Mulailah perjalanan belajarmu sekarang!
              </p>
              <Link to={AppRoute.exam.exams.url}>
                <Button className="rounded-full px-8 h-12 font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
                  Mulai Ujian Pertama
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
