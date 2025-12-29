import { createFileRoute } from '@tanstack/react-router'
import { usePeriodicElementQuery } from '@/service/periodic-table-api'
import {
  ElementErrorDisplay, ElementSkeleton, ElementHero,
} from '@/components/pages/periodic-table/element-details'
import {
  ElementIsotope,
} from '@/components/pages/periodic-table/element-isotope'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { getElementStyle } from '@/components/pages/periodic-table/utils/element-styles'

export const Route = createFileRoute('/_v1/periodic-table/isotope/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();
  const { id } = Route.useParams()
  const store = useAppStore();
  const { viewMode } = store.periodicTable;
  const language = useAuthStore(state => state.language);

  const { data: element, isLoading, isError, error } = usePeriodicElementQuery({ atomicNumber: parseInt(id), language }); 

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

  const elementStyle = getElementStyle(element?.atomicGroup as string, viewMode).element ?? "";
  const atomColor = getElementStyle(element?.atomicGroup as string, viewMode).atomColor ?? "";
  return (
    <div className="container mx-auto gap-4 flex flex-col pb-6">
      {element && (
        <>
          <ElementHero element={element} theme={viewMode} />
          <ElementIsotope 
            isotopes={element.atomicIsotope ?? []} 
          />
        </>
      )}
    </div>
  )
}