import { createFileRoute } from '@tanstack/react-router'
import { PeriodicTable, usePeriodicData } from '@/components/pages/table-periodic/table-periodic'

export const Route = createFileRoute('/_v1/periodic-table/route-tes')({
  component: RouteComponent,
})

function RouteComponent() {
  const { layouts } = usePeriodicData()
  
  const handleCellClick = (atom: any) => {
    console.log('Clicked element:', atom)
    // Handle element click here
  }

  if (layouts.length === 0) {
    return <div>Loading periodic table...</div>
  }

  return (
    <div className="w-full h-screen">
      <PeriodicTable 
        layouts={layouts} 
        onCellClicked={handleCellClick} 
      />
    </div>
  )
}