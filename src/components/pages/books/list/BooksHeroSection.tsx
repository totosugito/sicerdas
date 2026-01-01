import { useTranslation } from 'react-i18next'
import { Search, BookOpen } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BooksHeroSectionProps {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  onSearch: () => void
  isSearchDisabled?: boolean
}

export function BooksHeroSection({ 
  searchTerm, 
  onSearchTermChange, 
  onSearch, 
  isSearchDisabled = false 
}: BooksHeroSectionProps) {
  const { t } = useTranslation()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-blue-500/10 to-purple-600/10 border-b">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="relative px-6 py-8 mx-auto max-w-7xl">
        <div className="flex flex-col text-center gap-y-4 items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/15 rounded-full">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {t('home.title')}
            </span>
          </h1>
          <p className="mx-auto text-xl text-muted-foreground max-w-2xl">
            {t('home.subtitle')}
          </p>
          
          {/* Search Bar */}
          <div className="flex items-center max-w-md mx-auto space-x-2">
            <div className="relative flex-1">
              <Input
                placeholder={t('home.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 bg-background/80 backdrop-blur-sm border-border/50"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            </div>
            <Button onClick={onSearch} disabled={isSearchDisabled}>
              {t('home.search')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}