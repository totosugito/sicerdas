import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useTranslation, Trans } from 'react-i18next'
import { useBookList, useBookFilterParams, BookListItem } from '@/api/book/book'
import { BookOpen, LayoutGrid, ListIcon } from 'lucide-react'
import { showNotifError } from '@/lib/show-notif'
import { Book, BookListResponse, BooksSkeleton, BookFilter, BookCard, BookSearchBar, BookSortSelector } from '@/components/pages/book/list'
import { EnumViewMode } from "@/constants/app-enum";
import { DataTablePagination } from '@/components/custom/table';
import { useAppStore } from '@/stores/useAppStore'
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/(pages)/(book)/books')({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(1),
    limit: z.number().min(1).max(20).optional().catch(12),
    search: z.string().optional().catch(''),
    category: z.array(z.number()).optional().catch([]),
    group: z.array(z.number()).optional().catch([]),
    grade: z.array(z.number()).optional().catch([]),
    sortBy: z.string().optional().catch('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().catch('desc'),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const { page: urlPage, limit: urlLimit, search: urlSearch, category: urlCategory, group: urlGroup, grade: urlGrade, sortBy: urlSortBy, sortOrder: urlSortOrder } = Route.useSearch()
  const navigate = Route.useNavigate()

  const [searchTerm, setSearchTerm] = useState(urlSearch || '')
  const [books, setBooks] = useState<BookListItem[]>([])
  const [currentPage, setCurrentPage] = useState(urlPage || 1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalBooks, setTotalBooks] = useState(0)
  const selectedFilters = {
    categories: urlCategory || [-1],
    groups: urlGroup || [],
    grades: urlGrade || []
  }
  const [sortBy, setSortBy] = useState(urlSortBy || 'createdAt')
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(urlSortOrder || 'desc')

  type ViewMode = (typeof EnumViewMode)[keyof typeof EnumViewMode]["value"];

  const store = useAppStore();
  const pageStore = store.books;
  const [viewMode, setViewMode] = useState<ViewMode>(pageStore.viewMode ?? EnumViewMode.grid.value)
  const [isLoading, setIsLoading] = useState(true)

  const bookListMutation = useBookList()
  const filterParamsQuery = useBookFilterParams()

  const updateUrlParams = (newPage?: number, newSearch?: string, newFilters?: { categories: number[], groups: number[], grades?: number[] }, newSortBy?: string, newSortOrder?: 'asc' | 'desc') => {
    navigate({
      search: {
        page: newPage || currentPage,
        limit: urlLimit || 12,
        search: newSearch !== undefined ? newSearch : searchTerm,
        category: newFilters?.categories || selectedFilters.categories,
        group: newFilters?.groups || selectedFilters.groups,
        grade: newFilters?.grades || selectedFilters.grades,
        sortBy: newSortBy !== undefined ? newSortBy : sortBy,
        sortOrder: newSortOrder !== undefined ? newSortOrder : sortOrder,
      },
      replace: true,
    })
  }

  const loadBooks = async (page: number = 1, search: string = '', filters = selectedFilters, sort: { sortBy: string, sortOrder: 'asc' | 'desc' } = { sortBy, sortOrder }) => {
    setIsLoading(true)
    try {
      const response = await bookListMutation.mutateAsync({
        page,
        limit: urlLimit || 12,
        search: search.trim() || undefined,
        category: filters.categories.length > 0 ? filters.categories : undefined,
        group: filters.groups.length > 0 ? filters.groups : undefined,
        grade: filters.grades && filters.grades.length > 0 ? filters.grades : undefined,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
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
      categories: urlCategory || [-1],
      groups: urlGroup || [],
      grades: urlGrade || []
    }, {
      sortBy: urlSortBy || 'createdAt',
      sortOrder: urlSortOrder || 'desc'
    })
  }, [urlPage, urlSearch, urlCategory, urlGroup, urlGrade, urlSortBy, urlSortOrder])

  const handleSearch = (term: string = searchTerm) => {
    updateUrlParams(1, term)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams(page, searchTerm)
  }

  const handleFilterChange = (filters: { categories: number[], groups: number[], grades?: number[] }) => {
    updateUrlParams(1, searchTerm, filters)
  }

  const handleViewModeChange = (mode: ViewMode) => {
    store.setBooks({ ...pageStore, viewMode: mode })
    setViewMode(mode)
  }

  const handleSortChange = (newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    updateUrlParams(1, searchTerm, selectedFilters, newSortBy, newSortOrder)
  }

  return (
    <div className="flex flex-col flex-1 w-full px-8 pt-14 py-6">
      <div className="flex flex-col lg:flex-row gap-8 pt-6">
        <aside className="hidden lg:block w-70 flex-shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <BookFilter
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              autoSubmit={true}
              filterData={filterParamsQuery.data}
              idPrefix="sidebar"
            />
          </div>
        </aside>



        {/* Book List Content */}
        <div className="flex flex-col flex-1 gap-4">
          {/* Loading State */}
          {isLoading && <BooksSkeleton viewMode={viewMode} length={8} />}

          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <BookSearchBar
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              onSearch={handleSearch}
              isSearchDisabled={bookListMutation.isPending}
              filterData={filterParamsQuery.data}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
            />

            {/* View Toggles and Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {totalBooks !== undefined && (
                <p className="text-slate-500 dark:text-slate-400">
                  <Trans
                    i18nKey="book.info.showingText"
                    values={{ count: books.length, total: totalBooks }}
                    components={{
                      bold: <span className="font-bold text-slate-900 dark:text-white" />
                    }}
                  />
                </p>
              )}

              <div className="flex items-center gap-4">
                <BookSortSelector
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                />
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-6 w-6"
                    onClick={() => handleViewModeChange?.('grid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-6 w-6"
                    onClick={() => handleViewModeChange?.('list')}
                  >
                    <ListIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Books Display */}
            {!isLoading && books.length > 0 && (
              <BookCard
                books={books}
                viewMode={viewMode === 'grid' ? 'grid' : 'list'}
              />
            )}
          </div>

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
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
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
                showPageLabel={false}
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