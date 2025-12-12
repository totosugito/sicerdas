import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (term: string) => void
}

export function SearchBar({ searchTerm, onSearchChange }: SearchBarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex justify-center mb-6">
      <div className="max-w-md w-full relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('periodicTable.chemistryDictionary.searchBar.placeholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 bg-card"
        />
        {searchTerm && (
          <Button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1 h-7 w-7 text-muted-foreground"
            variant="ghost"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}