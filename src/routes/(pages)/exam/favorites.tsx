import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useFavoritePackages } from "@/api/exam-packages";
import { useAppTranslation } from "@/lib/i18n-typed";
import { 
  PackageSkeleton, 
  PackageCard 
} from "@/components/pages/exam/exams";
import { DataTablePagination } from "@/components/custom/table";
import { Bookmark, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppRoute } from "@/constants/app-route";
import { Link } from "@tanstack/react-router";
import { PageTitle } from "@/components/app";

const favoritesSearchSchema = z.object({
  page: z.number().min(1).optional().catch(undefined),
  pageSize: z.number().min(1).max(50).optional().catch(undefined),
});

type FavoritesSearch = z.infer<typeof favoritesSearchSchema>;

export const Route = createFileRoute("/(pages)/exam/favorites")({
  validateSearch: (search) => favoritesSearchSchema.parse(search),
  component: FavoritesRouteComponent,
});

function FavoritesRouteComponent() {
  const { t } = useAppTranslation();
  const { page = 1, pageSize = 12 } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data: res, isLoading } = useFavoritePackages({ page, pageSize });
  const favorites = res?.data || [];
  const pagination = res?.pagination;

  const handlePageChange = (newPage: number) => {
    navigate({
      search: (prev: FavoritesSearch) => ({ ...prev, page: newPage }),
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    navigate({
      search: (prev: FavoritesSearch) => ({ ...prev, pageSize: newPageSize, page: 1 }),
    });
  };

  return (
    <div className="page-container py-8">
      <div className="flex flex-col gap-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageTitle
            title={t(($) => $.exam.sessions.dashboard.favorites.title)}
            description={t(($) => $.exam.sessions.dashboard.favorites.description)}
          />
          <Link to={AppRoute.exam.exams.url}>
            <Button variant="outline" className="rounded-full font-bold px-6">
              <Search className="w-4 h-4 mr-2" />
              Jelajahi Paket
            </Button>
          </Link>
        </div>

        {/* Content Section */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <PackageSkeleton viewMode="list" length={pageSize} />
          ) : favorites.length > 0 ? (
            <div className="flex flex-col gap-4">
              <PackageCard exams={favorites as any} viewMode="list" />
              
              {pagination && pagination.totalPages > 1 && (
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <DataTablePagination
                    pageIndex={pagination.page - 1}
                    setPageIndex={(newIndex) => handlePageChange(newIndex + 1)}
                    pageSize={pagination.pageSize}
                    setPageSize={handlePageSizeChange}
                    rowsCount={pagination.total}
                    paginationData={{
                      page: pagination.page,
                      limit: pagination.pageSize,
                      total: pagination.total,
                      totalPages: pagination.totalPages,
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
                <Bookmark className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {t(($) => $.exam.sessions.dashboard.favorites.empty)}
              </h3>
              <p className="text-slate-500 max-w-sm text-center mb-8">
                {t(($) => $.exam.sessions.dashboard.favorites.emptyDesc)}
              </p>
              <Link to={AppRoute.exam.exams.url}>
                <Button className="rounded-full px-8 h-12 font-black text-lg bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20">
                  Cari Paket Favoritmu
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
