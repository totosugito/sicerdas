import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Atom, FileSearch } from 'lucide-react'
import { PeriodicCell } from '@/components/pages/periodic-table/periodic-table'
import { useTranslation } from 'react-i18next'

// Import components from the element-comparison directory
import { 
  SearchBar, 
  SortingControls, 
  ElementComparisonItem,
  ProgressElement
} from '@/components/pages/periodic-table/element-comparison'

// Import types
import type { PeriodicElement, PropertyDefinition, SortDirection } from '@/components/pages/periodic-table/element-comparison/types'

// Import the periodic layout data
import periodicLayoutData from '@/data/table-periodic/periodic_layout.json'

export const Route = createFileRoute('/_v1/periodic-table/element-comparison')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();
  
  // Filter elements with atomicId in range 1-200 and with valid properties
  const validElements = useMemo(() => {
    return (periodicLayoutData as PeriodicElement[])
      .filter(element =>
        element.atomicId >= 1 &&
        element.atomicId <= 200 &&
        element.atomicNumber > 0 &&
        element.prop
      )
  }, [])

  // State for selected element
  const [selectedElementId, setSelectedElementId] = useState<number | null>(null)

  // State for sorting type and direction
  const sortType = {
    asc: {
      value: 'asc',
      label: t('periodicTable.elementComparison.sort.asc')
    },
    desc: {
      value: 'desc',
      label: t('periodicTable.elementComparison.sort.desc')
    },
    none: {
      value: 'none',
      label: t('periodicTable.elementComparison.sort.none')
    }
  } as const

  // Property definitions for comparison
  const propertyDefinitions: PropertyDefinition[] = [
    { key: 'atomicWeight', label: t('periodicTable.periodicTable.var.atomicWeight'), unit: t('periodicTable.elementComparison.units.u') },
    { key: 'numberOfElectron', label: t('periodicTable.periodicTable.var.numberOfElectron'), unit: t('periodicTable.elementComparison.units.none') },
    { key: 'meltingPoint', label: t('periodicTable.periodicTable.var.meltingPoint'), unit: t('periodicTable.elementComparison.units.celsius') },
    { key: 'boilingPoint', label: t('periodicTable.periodicTable.var.boilingPoint'), unit: t('periodicTable.elementComparison.units.celsius') },
    { key: 'density', label: t('periodicTable.periodicTable.var.density'), unit: t('periodicTable.elementComparison.units.gPerCm3') },
    { key: 'molarVolume', label: t('periodicTable.periodicTable.var.molarVolume'), unit: t('periodicTable.elementComparison.units.cm3PerMol') },
    { key: 'bulkModulus', label: t('periodicTable.periodicTable.var.bulkModulus'), unit: t('periodicTable.elementComparison.units.gpa') },
    { key: 'shearModulus', label: t('periodicTable.periodicTable.var.shearModulus'), unit: t('periodicTable.elementComparison.units.gpa') },
    { key: 'youngModulus', label: t('periodicTable.periodicTable.var.youngModulus'), unit: t('periodicTable.elementComparison.units.gpa') },
    { key: 'electronegativity', label: t('periodicTable.periodicTable.var.electronegativity'), unit: t('periodicTable.elementComparison.units.none') },
    { key: 'electricalConductivity', label: t('periodicTable.periodicTable.var.electricalConductivity'), unit: t('periodicTable.elementComparison.units.sPerM') },
    { key: 'resistivity', label: t('periodicTable.periodicTable.var.resistivity'), unit: t('periodicTable.elementComparison.units.ohmM') },
    { key: 'atomicRadius', label: t('periodicTable.periodicTable.var.atomicRadius'), unit: t('periodicTable.elementComparison.units.pm') },
    { key: 'vanDerWaalsRadius', label: t('periodicTable.periodicTable.var.vanDerWaalsRadius'), unit: t('periodicTable.elementComparison.units.pm') },
  ]
  const [sortBy, setSortBy] = useState<string>(propertyDefinitions[0].key)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // State for search term
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Filter elements based on search term
  const filteredElements = useMemo(() => {
    if (!searchTerm) return validElements

    const term = searchTerm.toLowerCase()
    return validElements.filter(element =>
      element.atomicName.toLowerCase().includes(term) ||
      element.atomicSymbol.toLowerCase().includes(term) ||
      element.atomicNumber.toString().includes(term)
    )
  }, [validElements, searchTerm])

  // Sort filtered elements
  const sortedElements = useMemo(() => {
    return [...filteredElements].sort((a, b) => {
      let comparison = 0

      let sortBy_ = sortBy
      if (sortDirection === sortType.none.value) {
        sortBy_ = 'atomicId'
      }

      const propA = a.prop?.[sortBy_ as keyof typeof a.prop] || ''
      const propB = b.prop?.[sortBy_ as keyof typeof b.prop] || ''

      // Handle numeric sorting
      const numA = parseFloat(propA as string)
      const numB = parseFloat(propB as string)

      if (!isNaN(numA) && !isNaN(numB)) {
        comparison = numA - numB
      } else {
        comparison = propA.toString().localeCompare(propB.toString())
      }

      return sortDirection === sortType.asc.value ? comparison : -comparison
    })
  }, [filteredElements, sortBy, sortDirection])

  // Get the range of values for the current sort property
  const getCurrentPropertyRange = () => {
    const values = sortedElements
      .map(el => parseFloat(el.prop?.[sortBy as keyof typeof el.prop] as string || '0'))
      .filter(val => !isNaN(val))

    if (values.length === 0) return { min: 0, max: 1 }

    return {
      min: Math.min(...values),
      max: Math.max(...values)
    }
  }

  const propertyRange = getCurrentPropertyRange()

  // Simple progress bar component
  const ProgressBar = ({ value, max }: { value: number; max: number }) => {
    return (
      <ProgressElement value={value} max={max}/>
    )
  }

  // Set sort by and keep direction
  const setSortByAndKeepDirection = (newSortBy: string) => {
    setSortBy(newSortBy)
  }

  return (
    <div className="container mx-auto py-10">
      {/* Header Section - Centered with Icon */}
      <header className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Atom className="h-7 w-7" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {t('periodicTable.elementComparison.pageTitle')}
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {t('periodicTable.elementComparison.pageSubtitle')}
        </p>
      </header>

      {/* Search and Controls Section */}
      <div className="bg-card border rounded-xl p-6 shadow-sm mb-8">
        {/* Search Bar */}
        <SearchBar 
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          placeholder={t('periodicTable.elementComparison.searchBar.placeholder')}
        />

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {searchTerm ? 
              t('periodicTable.elementComparison.elementsFoundMatching', { count: sortedElements.length, term: searchTerm }) :
              t('periodicTable.elementComparison.elementsFound', { count: sortedElements.length })
            }
          </div>

          <SortingControls
            propertyDefinitions={propertyDefinitions}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortByChange={setSortByAndKeepDirection}
            onSortDirectionChange={setSortDirection}
            sortType={sortType}
          />
        </div>
      </div>

      {/* Element List with Progress Bars */}
      <div className="space-y-4">
        {sortedElements.map(element => {
          const propertyValue = parseFloat(element.prop?.[sortBy as keyof typeof element.prop] as string || '0')
          const maxValue = propertyRange.max || 1
          const currentProperty = propertyDefinitions.find(p => p.key === sortBy)
          const unit = currentProperty?.unit || ''
          const propertyLabel = currentProperty?.label || ''

          return (
            <ElementComparisonItem
              key={element.atomicId}
              element={element}
              isSelected={selectedElementId === element.atomicId}
              onSelect={setSelectedElementId}
              propertyValue={propertyValue}
              maxValue={maxValue}
              unit={unit}
              propertyLabel={propertyLabel}
              propertyDefinitions={propertyDefinitions}
            />
          )
        })}

        {sortedElements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed bg-muted/30">
            <div className="rounded-full bg-primary/10 p-4 mb-6">
              <FileSearch className="h-10 w-10 text-primary" />
            </div>            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('periodicTable.elementComparison.noElementsFound')}
            </h3>
            <p className="text-muted-foreground max-w-md text-center px-4">
              {searchTerm ? 
                t('periodicTable.elementComparison.noElementsFoundMatching', { term: searchTerm }) : 
                t('periodicTable.elementComparison.noElementsFound')
              }
            </p>
            {!searchTerm && (
              <Button 
                variant="outline" 
                className="mt-6 group"
                onClick={() => {
                  const randomElement = validElements[Math.floor(Math.random() * validElements.length)];
                  if (randomElement) {
                    setSearchTerm(randomElement.atomicName);
                  }
                }}
              >
                <Search className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                {t('periodicTable.elementComparison.searchBar.placeholder')}
              </Button>
            )}
          </div>
        )}      </div>
    </div>
  )
}