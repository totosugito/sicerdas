import { createFileRoute } from '@tanstack/react-router'
import { PeriodicTable } from '@/components/pages/periodic-table/periodic-table'
import periodicLayouts from '@/data/table-periodic/periodic_layout.json'
import { useAppStore } from '@/stores/useAppStore'
export const Route = createFileRoute('/(pages)/(periodic-table)/periodic-table')({
  component: RouteComponent,
})

function RouteComponent() {
  const store = useAppStore();
  const pageProps = store.periodicTable;

  return (
    <div className='flex flex-col flex-1 mt-14'>
      <PeriodicTable
        elements={periodicLayouts}
        theme={pageProps.viewMode} // Pass theme from store
      />
    </div>
  )
}