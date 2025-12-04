import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import dictionaryDataEn from '@/data/table-periodic/periodic_dictionary-en.json'
import { ChemistryCard } from '@/components/pages/table-periodic/chemistry-dictionary/ChemistryCard'
import { SearchBar } from '@/components/pages/table-periodic/chemistry-dictionary/SearchBar'
import { AlphabetFilter, ALPHABET_GROUPS } from '@/components/pages/table-periodic/chemistry-dictionary/AlphabetFilter'
import { LocalePagination } from '@/components/custom/components'
import { ChemistryHeader } from '@/components/pages/table-periodic/chemistry-dictionary'

// Define the dictionary entry type
interface ChemistryTerm {
  dictId: number
  dictLocale: string
  dictWord: string
  dictTr: string
}

function ChemistryDictionary() {
  const [activeGroup, setActiveGroup] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const itemsPerPage = 12

  // Filter entries based on active group and search term
  const filteredTerms = useMemo(() => {
    let filtered = dictionaryDataEn as ChemistryTerm[]
    
    // Apply alphabet group filter
    if (activeGroup !== 'all') {
      const group = ALPHABET_GROUPS.find(g => g.id === activeGroup)
      if (group) {
        filtered = filtered.filter(entry => 
          group.range.test(entry.dictWord.charAt(0).toUpperCase())
        )
      }
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(entry => 
        entry.dictWord.toLowerCase().includes(term) || 
        entry.dictTr.toLowerCase().includes(term)
      )
    }
    
    return filtered
  }, [activeGroup, searchTerm])

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
        totalTerms={dictionaryDataEn.length} 
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
        Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTerms.length)} dari {filteredTerms.length} entri
      </div>
      
      {/* Dictionary Entries Grid */}
      {paginatedTerms.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedTerms.map((term, index) => (
              <ChemistryCard key={term.dictId} term={term} index={index} />
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
          <div className="text-lg font-medium text-foreground mb-2">Tidak ada entri yang ditemukan</div>
          <p className="text-muted-foreground">
            Coba sesuaikan pencarian atau kriteria filter Anda
          </p>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute('/_v1/periodic-table/chemistry-dictionary')({
  component: ChemistryDictionary,
})