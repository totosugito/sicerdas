import { createFileRoute } from '@tanstack/react-router'
import { PeriodicTable } from '@/components/pages/table-periodic/table-periodic'
import { AppNavbar } from '@/components/app'
import { Footer } from '@/components/pages/landing'
import periodicLayouts from '@/data/table-periodic/periodic_layout.json'
export const Route = createFileRoute('/periodic-table')({
  component: RouteComponent,
})

function RouteComponent() {
  const handleCellClick = (atom: any) => {
    console.log('Clicked element:', atom)
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <AppNavbar />
      <div className='flex flex-col flex-1 mt-18'>
        <PeriodicTable
          layouts={periodicLayouts}
          onCellClicked={handleCellClick}
        />
      </div>
      <Footer />
    </div>
  )
}