import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Atom } from 'lucide-react'

// Define the PeriodicElement interface
interface PeriodicElement {
  atomicId: number
  idx: number
  idy: number
  atomicNumber: number
  atomicGroup: string
  atomicName: string
  atomicSymbol: string
  prop?: {
    atomicWeight: string
    phase: string
    group: string
    period: string
    block: string
    series: string
    color: string
    numberOfElectron: string
    meltingPoint: string
    boilingPoint: string
    density: string
    molarVolume: string
    bulkModulus: string
    shearModulus: string
    youngModulus: string
    electronegativity: string
    electricalConductivity: string
    resistivity?: string
    atomicRadius?: string
    vanDerWaalsRadius?: string
  }
}

// Import the periodic layout data
import periodicLayoutData from '@/data/table-periodic/periodic_layout.json'

export const Route = createFileRoute('/_v1/periodic-table/element-comparison')({
  component: RouteComponent,
})

function RouteComponent() {
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
  const [sortBy, setSortBy] = useState<string>('atomicWeight')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
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
      
      if (sortBy === 'atomicId') {
        comparison = a.atomicId - b.atomicId
      } else {
        const propA = a.prop?.[sortBy as keyof typeof a.prop] || ''
        const propB = b.prop?.[sortBy as keyof typeof b.prop] || ''
        
        // Handle numeric sorting
        const numA = parseFloat(propA as string)
        const numB = parseFloat(propB as string)
        
        if (!isNaN(numA) && !isNaN(numB)) {
          comparison = numA - numB
        } else {
          // Fallback to string comparison
          comparison = propA.toString().localeCompare(propB.toString())
        }
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredElements, sortBy, sortDirection])

  // Get the range of values for the current sort property
  const getCurrentPropertyRange = () => {
    if (sortBy === 'atomicId') {
      const values = sortedElements.map(el => el.atomicId)
      return {
        min: Math.min(...values),
        max: Math.max(...values)
      }
    }
    
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

  // Property definitions for comparison
  const propertyDefinitions = [
    { key: 'atomicWeight', label: 'Atomic Weight', unit: 'u' },
    { key: 'numberOfElectron', label: 'Number of Electrons', unit: '' },
    { key: 'meltingPoint', label: 'Melting Point', unit: '°C' },
    { key: 'boilingPoint', label: 'Boiling Point', unit: '°C' },
    { key: 'density', label: 'Density', unit: 'g/cm³' },
    { key: 'molarVolume', label: 'Molar Volume', unit: 'cm³/mol' },
    { key: 'bulkModulus', label: 'Bulk Modulus', unit: 'GPa' },
    { key: 'shearModulus', label: 'Shear Modulus', unit: 'GPa' },
    { key: 'youngModulus', label: 'Young Modulus', unit: 'GPa' },
    { key: 'electronegativity', label: 'Electronegativity', unit: '' },
    { key: 'electricalConductivity', label: 'Electrical Conductivity', unit: 'S/m' },
    { key: 'resistivity', label: 'Resistivity', unit: 'Ω·m' },
    { key: 'atomicRadius', label: 'Atomic Radius', unit: 'pm' },
    { key: 'vanDerWaalsRadius', label: 'Van Der Waals Radius', unit: 'pm' },
  ]

  // Simple progress bar component
  const ProgressBar = ({ value, max }: { value: number; max: number }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0
    return (
      <div className="w-full bg-secondary rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    )
  }

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
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
            Periodic Element Comparison
          </h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Compare properties of chemical elements with visual progress indicators
        </p>
      </header>
      
      {/* Search and Controls Section */}
      <div className="bg-card border rounded-xl p-6 shadow-sm mb-8">
        {/* Search Bar */}
        <div className="flex gap-2 p-2 bg-card/80 backdrop-blur-xl rounded-xl shadow-sm border border-border/50 mb-6">
          <div className="flex-1 flex items-center gap-2 px-4">
            <Search className="text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search elements by name, symbol, or atomic number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 p-0 h-auto shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Sort by: {propertyDefinitions.find(p => p.key === sortBy)?.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {propertyDefinitions.map(property => (
                  <DropdownMenuItem 
                    key={property.key}
                    onClick={() => setSortByAndKeepDirection(property.key)}
                  >
                    {property.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {sortBy === 'atomicId' 
                    ? 'Sort by Atomic ID' 
                    : `Sort Direction: ${sortDirection === 'asc' ? '↑ Ascending' : '↓ Descending'}`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortDirection('asc')}>
                  ↑ Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortDirection('desc')}>
                  ↓ Descending
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => {
                    setSortBy('atomicId');
                    setSortDirection('asc');
                  }}
                >
                  Sort by Atomic ID
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {sortedElements.length} elements found
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>
      </div>
      
      {/* Element List with Progress Bars */}
      <div className="space-y-4">
        {sortedElements.map(element => {
          const propertyValue = sortBy === 'atomicId' 
            ? element.atomicId 
            : parseFloat(element.prop?.[sortBy as keyof typeof element.prop] as string || '0')
          const maxValue = propertyRange.max || 1
          
          return (
            <div 
              key={element.atomicId} 
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedElementId === element.atomicId 
                  ? 'ring-2 ring-primary' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => setSelectedElementId(
                selectedElementId === element.atomicId ? null : element.atomicId
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold text-primary">{element.atomicSymbol}</span>
                  </div>
                  <div>
                    <h3 className="font-bold">{element.atomicName}</h3>
                    <p className="text-sm text-muted-foreground">
                      #{element.atomicNumber} • {element.atomicSymbol}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono">
                    {propertyValue.toFixed(2)} {propertyDefinitions.find(p => p.key === sortBy)?.unit}
                  </p>
                </div>
              </div>
              
              <div className="mt-2">
                <ProgressBar value={propertyValue} max={maxValue} />
              </div>
              
              {selectedElementId === element.atomicId && (
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-3">
                    {propertyDefinitions.map(property => {
                      const value = property.key === 'atomicId' 
                        ? element.atomicId 
                        : element.prop?.[property.key as keyof typeof element.prop] || 'N/A'
                      return (
                        <div key={property.key} className="text-sm">
                          <span className="font-medium text-muted-foreground">{property.label}:</span>{' '}
                          <span className="font-mono">{value} {property.unit}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        
        {sortedElements.length === 0 && (
          <div className="text-center py-12">
            <div className="text-lg font-medium text-foreground mb-2">
              No elements found
            </div>
            <p className="text-muted-foreground">
              {searchTerm ? `No elements match your search for "${searchTerm}". Try different keywords.` : 'No elements available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}