import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/useAuthStore'
import dictionaryDataEn from '@/data/table-periodic/periodic_dictionary_en.json'
import dictionaryDataId from '@/data/table-periodic/periodic_dictionary_id.json'
import { ChemistryCard, AlphabetFilter, ALPHABET_GROUPS, ChemistryHeader, SearchBar } from '@/components/pages/periodic-table/chemistry-dictionary'
import { LocalePagination } from '@/components/custom/components'

// Define the dictionary entry type
interface ChemistryTerm {
  id: number
  w: string
  tr: string
}

function ChemistryDictionary() {
  const { t, i18n } = useTranslation()
  const authLanguage = useAuthStore((state) => state.language)
  const [activeGroup, setActiveGroup] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const itemsPerPage = 12

  // Filter entries based on active group and search term
  const filteredTerms = useMemo(() => {
    // Select dictionary data based on current language from auth store
    const dictionaryData = authLanguage === 'id' ? dictionaryDataId : dictionaryDataEn
    let filtered = dictionaryData as ChemistryTerm[]
    
    // Apply alphabet group filter
    if (activeGroup !== 'all') {
      const group = ALPHABET_GROUPS.find(g => g.id === activeGroup)
      if (group) {
        filtered = filtered.filter(entry => 
          group.range.test(entry.w.charAt(0).toUpperCase())
        )
      }
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(entry => 
        entry.w.toLowerCase().includes(term) || 
        entry.tr.toLowerCase().includes(term)
      )
    }
    
    return filtered
  }, [activeGroup, searchTerm, authLanguage])

  // Calculate pagination
  const totalPages = Math.ceil(filteredTerms.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTerms = filteredTerms.slice(startIndex, startIndex + itemsPerPage)

  // Reset to first page when filters change
  const handleFilterChange = (groupId: string) => {
    setActiveGroup(groupId)
    setCurrentPage(1)
  }

  const handleSearchChange = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  return (
    <div className="container mx-auto py-8">
      <ChemistryHeader 
        totalTerms={authLanguage === 'id' ? dictionaryDataId.length : dictionaryDataEn.length} 
      />
      
      {/* Search Bar */}
      <SearchBar 
        searchTerm={searchTerm} 
        onSearchChange={handleSearchChange} 
      />
      
      {/* Alphabet Group Navigation */}
      <AlphabetFilter 
        activeGroup={activeGroup} 
        onGroupChange={handleFilterChange} 
      />
      
      {/* Results Info */}
      <div className="mb-4 text-sm text-muted-foreground text-center">
        {t('periodicTable.chemistryDictionary.resultsInfo', { 
          start: startIndex + 1, 
          end: Math.min(startIndex + itemsPerPage, filteredTerms.length), 
          total: filteredTerms.length 
        })}
      </div>
      
      {/* Dictionary Entries Grid */}
      {paginatedTerms.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedTerms.map((term, index) => (
              <ChemistryCard key={term.id} term={term} index={index} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <LocalePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-lg font-medium text-foreground mb-2">
            {t('periodicTable.chemistryDictionary.noEntriesFound.title')}
          </div>
          <p className="text-muted-foreground">
            {t('periodicTable.chemistryDictionary.noEntriesFound.description')}
          </p>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/_v1/periodic-table/chemistry-dictionary')({
  component: ChemistryDictionary,
})