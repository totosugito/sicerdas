import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_v1/periodic-table/element/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { atomicNumber } = Route.useParams()
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-4">
        <Link to="/periodic-table">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Periodic Table
          </Button>
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Element Details for Atomic Number {atomicNumber}</h1>
        <p>Full element details page for element with atomic number {atomicNumber}.</p>
        {/* This would be expanded with actual element data in a real implementation */}
      </div>
    </div>
  )
}