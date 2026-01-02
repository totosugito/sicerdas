import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useBookList } from '@/service/book'
import { Button } from '@/components/ui/button'
import { AppNavbar, PageTitle } from '@/components/app'
import { Grid, List, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { showNotifError } from '@/lib/show-notif'
import { Book, BookCard, BookList, BookListResponse, BooksHeroSection, BooksSkeleton } from '@/components/pages/books/list'
import { EnumViewMode } from "@/constants/app-enum";
import { DataTablePagination } from '@/components/custom/table';
import { useAppStore } from '@/stores/useAppStore'

export const Route = createFileRoute('/(pages)/(book)/books')({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(1),
    limit: z.number().min(1).max(20).optional().catch(12),
    search: z.string().optional().catch(''),
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const { page: urlPage, limit: urlLimit, search: urlSearch } = Route.useSearch()
  const navigate = Route.useNavigate()

  const [searchTerm, setSearchTerm] = useState(urlSearch || '')
  const [books, setBooks] = useState<Book[]>([])
  const [currentPage, setCurrentPage] = useState(urlPage || 1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalBooks, setTotalBooks] = useState(0)

  type ViewMode = (typeof EnumViewMode)[keyof typeof EnumViewMode]["value"];

  const store = useAppStore();
  const pageStore = store.books;
  const [viewMode, setViewMode] = useState<ViewMode>(pageStore.viewMode ?? EnumViewMode.grid.value)
  const [isLoading, setIsLoading] = useState(true)
  console.log(pageStore.viewMode, viewMode);

  const bookListMutation = useBookList()

  const updateUrlParams = (newPage?: number, newSearch?: string) => {
    navigate({
      search: {
        page: newPage || currentPage,
        limit: urlLimit || 12,
        search: newSearch !== undefined ? newSearch : searchTerm,
      },
      replace: true,
    })
  }

  const loadBooks = async (page: number = 1, search: string = '') => {
    setIsLoading(true)
    try {
      const response = await bookListMutation.mutateAsync({
        page,
        limit: urlLimit || 12,
        search: search.trim() || undefined,
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
    loadBooks(urlPage || 1, urlSearch || '')
  }, [urlPage, urlSearch])

  const handleSearch = () => {
    updateUrlParams(1, searchTerm)
  }

  const handlePageChange = (page: number) => {
    updateUrlParams(page, searchTerm)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <AppNavbar />

      <div className='flex flex-col flex-1 mt-14'>
        {/* Hero Section */}
        <BooksHeroSection
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearch={handleSearch}
          isSearchDisabled={bookListMutation.isPending}
        />

        {/* Main Content */}
        <div className="p-8">
          {/* Controls Bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <PageTitle
                title={`${totalBooks} ${t(`home.booksAvailable`)}`}
                description={<span>{t('home.exploreCollection')}</span>}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === EnumViewMode.grid.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  store.setBooks({ ...pageStore, viewMode: EnumViewMode.grid.value })
                  setViewMode(EnumViewMode.grid.value)
                }}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === EnumViewMode.list.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  store.setBooks({ ...pageStore, viewMode: EnumViewMode.list.value })
                  setViewMode(EnumViewMode.list.value)
                }}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && <BooksSkeleton viewMode={viewMode} length={8} />}

          {/* Books Display */}
          {!isLoading && books.length > 0 && (
            <div className={cn(
              viewMode === EnumViewMode.grid.value
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "grid grid-cols-1 xl:grid-cols-2 gap-6"
            )}>
              {books.map((book) => (
                viewMode === EnumViewMode.grid.value ? (
                  <BookCard
                    key={book.id}
                    book={book}
                  />
                ) : (
                  <BookList
                    key={book.id}
                    book={book}
                  />
                )
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && books.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t("home.noBooksFound")}</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? `${t(`home.noSearchResults`)} ${searchTerm}`
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
            <div className="mt-4">
              <DataTablePagination
                pageIndex={currentPage - 1} // Convert 1-based to 0-based
                setPageIndex={(newPageIndex) => handlePageChange(newPageIndex + 1)} // Convert 0-based to 1-based
                pageSize={12}
                setPageSize={() => { }} // Not used since we're using paginationData
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
