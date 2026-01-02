import { createFileRoute } from '@tanstack/react-router'
import { useBookDetail } from '@/service/book'
import { BookDetail } from '@/components/pages/books/book/BookDetail'
import { Book } from '@/components/pages/books/types/books'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/(pages)/_books/book/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { t } = useTranslation()
  const { data, isLoading, error, isError } = useBookDetail(id)

  if (isLoading) {
    return <BookDetail book={{} as Book} isLoading={true} />
  }

  if (isError || !data?.success) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-4">
          <Link to="/books">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('shared.backToBooks')}
            </Button>
          </Link>
        </div>
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center text-destructive">
              <AlertTriangle className="w-5 h-5 mr-2" />
              <p>{t('errors.bookNotFound')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const book: Book = data.data

  return (
    <div>
      <div className="container mx-auto p-6 max-w-4xl mb-4">
        <Link to="/books">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('shared.backToBooks')}
          </Button>
        </Link>
      </div>
      <BookDetail book={book} />
    </div>
  )
}
