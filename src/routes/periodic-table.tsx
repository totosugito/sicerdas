import { createFileRoute } from '@tanstack/react-router'
import { PeriodicTable } from '@/components/pages/periodic-table/periodic-table'
import { AppNavbar } from '@/components/app'
import { Footer } from '@/components/pages/landing'
import periodicLayouts from '@/data/table-periodic/periodic_layout.json'
import { useState } from 'react'
import { useAppStore } from '@/stores/useAppStore'
export const Route = createFileRoute('/periodic-table')({
  component: RouteComponent,
})

function RouteComponent() {
  const store = useAppStore();
  const pageProps = store.periodicTable;
  
  const handleCellClick = (atom: any) => {
    console.log('Clicked element:', atom)
  }

  return (
    <div className="flex flex-col min-h-screen w-full bg-background">
      <AppNavbar />
      <div className='flex flex-col flex-1 mt-14'>
        <PeriodicTable
          elements={periodicLayouts}
          theme={pageProps.viewMode} // Pass theme from store
        />
      </div>
      <Footer />
    </div>
  )
}