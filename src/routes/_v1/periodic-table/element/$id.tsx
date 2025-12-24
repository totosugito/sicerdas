import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { usePeriodicElementQuery } from '@/service/periodic-table-api'
import { ElementErrorDisplay, ElementSkeleton } from '@/components/pages/periodic-table/element-details'

export const Route = createFileRoute('/_v1/periodic-table/element/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const { data: element, isLoading, isError, error } = usePeriodicElementQuery({ atomicNumber: parseInt(id) })

  if (isLoading) {
    return <ElementSkeleton />
  }

  if (isError) {
    return (
      <ElementErrorDisplay 
        error={error} 
        atomicNumber={parseInt(id)} 
      />
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {element ? (
          <>
            <h1 className="text-2xl font-bold mb-4">
              {element.atomicName} ({element.atomicSymbol}) - Atomic Number {element.atomicNumber}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Basic Information</h2>
                <p><strong>Group:</strong> {element.atomicGroup}</p>
                <p><strong>Atomic Number:</strong> {element.atomicNumber}</p>
                <p><strong>Atomic Mass:</strong> {element.atomicProperties?.atomicMass ? String(element.atomicProperties.atomicMass) : 'N/A'}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Additional Properties</h2>
                <p><strong>Electron Configuration:</strong> {element.atomicProperties?.electronConfiguration ? String(element.atomicProperties.electronConfiguration) : 'N/A'}</p>
                <p><strong>Atomic Radius:</strong> {element.atomicProperties?.atomicRadius ? String(element.atomicProperties.atomicRadius) : 'N/A'}</p>
              </div>
            </div>
            
            {element.notes && (
              <>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Overview</h2>
                  <p>{element.notes.atomicOverview}</p>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">History</h2>
                  <p>{element.notes.atomicHistory}</p>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Applications</h2>
                  <p>{element.notes.atomicApps}</p>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Facts</h2>
                  <p>{element.notes.atomicFacts}</p>
                </div>
              </>
            )}
          </>
        ) : (
          <p>Element not found</p>
        )}
      </div>
    </div>
  )
}