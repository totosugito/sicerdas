import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useBookList, useBookFilterParams } from '@/service/book'
import { BookOpen, Filter } from 'lucide-react'
import { showNotifError } from '@/lib/show-notif'
import { Book, BookListResponse, BooksSkeleton, BookFilter, BookListNew } from '@/components/pages/books/list'
import { EnumViewMode } from "@/constants/app-enum";
import { DataTablePagination } from '@/components/custom/table';
import { useAppStore } from '@/stores/useAppStore'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/(pages)/(book)/books')({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(1),
    limit: z.number().min(1).max(20).optional().catch(12),
    search: z.string().optional().catch(''),
    category: z.array(z.number()).optional().catch([]),
    group: z.array(z.number()).optional().catch([]),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const { page: urlPage, limit: urlLimit, search: urlSearch, category: urlCategory, group: urlGroup } = Route.useSearch()
  const navigate = Route.useNavigate()

  const [searchTerm, setSearchTerm] = useState(urlSearch || '')
  const [books, setBooks] = useState<Book[]>([])
  const [currentPage, setCurrentPage] = useState(urlPage || 1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalBooks, setTotalBooks] = useState(0)
  const [selectedFilters, setSelectedFilters] = useState({
    categories: urlCategory || [],
    groups: urlGroup || []
  })

  type ViewMode = (typeof EnumViewMode)[keyof typeof EnumViewMode]["value"];

  const store = useAppStore();
  const pageStore = store.books;
  const [viewMode, setViewMode] = useState<ViewMode>(pageStore.viewMode ?? EnumViewMode.grid.value)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [autoSubmitFilters, setAutoSubmitFilters] = useState(true)

  const bookListMutation = useBookList()
  const filterParamsQuery = useBookFilterParams()

  const updateUrlParams = (newPage?: number, newSearch?: string, newFilters?: { categories: number[], groups: number[] }) => {
    navigate({
      search: {
        page: newPage || currentPage,
        limit: urlLimit || 12,
        search: newSearch !== undefined ? newSearch : searchTerm,
        category: newFilters?.categories || selectedFilters.categories,
        group: newFilters?.groups || selectedFilters.groups,
      },
      replace: true,
    })
  }

  const loadBooks = async (page: number = 1, search: string = '', filters = selectedFilters) => {
    setIsLoading(true)
    try {
      const response = await bookListMutation.mutateAsync({
        page,
        limit: urlLimit || 12,
        search: search.trim() || undefined,
        category: filters.categories.length > 0 ? filters.categories : undefined,
        group: filters.groups.length > 0 ? filters.groups : undefined,
      }) as BookListResponse

      if (response.success) {
        setBooks(response.data.items)
        setTotalPages(response.data.totalPages)
        setTotalBooks(response.data.total)
        setCurrentPage(response.data.page)
      } else {
        showNotifError({ message: t('home.failedToLoadBooks') })
      }
    } catch (error) {
      showNotifError({ message: t('home.errorLoadingBooks') })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBooks(urlPage || 1, urlSearch || '', {
      categories: urlCategory || [],
      groups: urlGroup || []
    })
  }, [urlPage, urlSearch, urlCategory, urlGroup])

  const handleSearch = () => {
    updateUrlParams(1, searchTerm)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams(page, searchTerm)
  }

  const handleFilterChange = (filters: { categories: number[], groups: number[] }) => {
    setSelectedFilters(filters)
    updateUrlParams(1, searchTerm, filters)
    // Optional: Only close mobile filter if desired, but typically better to let user manually close
  }

  const handleViewModeChange = (mode: ViewMode) => {
    store.setBooks({ ...pageStore, viewMode: mode })
    setViewMode(mode)
  }

  const handleAutoSubmitChange = (enabled: boolean) => {
    setAutoSubmitFilters(enabled)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <BookFilter
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              autoSubmit={autoSubmitFilters}
              onAutoSubmitChange={handleAutoSubmitChange}
            />
          </div>
        </aside>

        {/* Mobile Filter Sheet */}
        <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">filter_alt</span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('home.filters')}</h2>
            </div>
            <BookFilter
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              autoSubmit={autoSubmitFilters}
              onAutoSubmitChange={handleAutoSubmitChange}
            />
          </SheetContent>
        </Sheet>

        {/* Book List Content */}
        <div className="flex-1 min-w-0">
          {/* Loading State */}
          {isLoading && <BooksSkeleton viewMode={viewMode} length={8} />}

          {/* Books Display */}
          {!isLoading && books.length > 0 && (
            <BookListNew
              books={books}
              viewMode={viewMode === 'grid' ? 'grid' : 'list'}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              onSearch={handleSearch}
              isSearchDisabled={bookListMutation.isPending}
              onViewModeChange={handleViewModeChange}
              onOpenFilter={() => setIsMobileFilterOpen(true)}
              totalBooks={totalBooks}
            />
          )}

          {/* Empty State */}
          {!isLoading && books.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t("home.noBooksFound")}</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
                {searchTerm
                  ? `${t(`home.noSearchResults`)} "${searchTerm}"`
                  : t('home.noBooksAvailable')
                }
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => {
                  setSearchTerm('')
                  updateUrlParams(1, '')
                }}>
                  {t('home.clearSearch')}
                </Button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <DataTablePagination
                pageIndex={currentPage - 1}
                setPageIndex={(newPageIndex) => handlePageChange(newPageIndex + 1)}
                pageSize={12}
                setPageSize={() => { }}
                rowsCount={totalBooks}
                paginationData={{
                  page: currentPage,
                  limit: urlLimit || 12,
                  total: totalBooks,
                  totalPages: totalPages
                }}
                showPageSize={false}
                disabled={bookListMutation.isPending}
                onPaginationChange={(paginationData) => {
                  handlePageChange(paginationData.page)
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}