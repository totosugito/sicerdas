import { createFileRoute } from '@tanstack/react-router'
import { usePeriodicElementQuery } from '@/service/periodic-table-api'
import {
  ElementErrorDisplay, ElementSkeleton, ElementHero, ElementNavigation,
  ElectronView, ElementOverview, ElementClassification, ElementDimension, ElementNotes, ElementThermal, ElementBulkPhysical, ElementElectrical, ElementMagnetic, ElementAbundances, ElementReactivity, ElementHealthSafety, ElementNuclear
} from '@/components/pages/periodic-table/element-details'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/stores/useAppStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { getElementStyle } from '@/components/pages/periodic-table/utils/element-styles'

export const Route = createFileRoute('/_v1/periodic-table/element/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();
  const { id } = Route.useParams()
  const store = useAppStore();
  const { viewMode } = store.periodicTable;
  const language = useAuthStore(state => state.language);

  const { data: element, isLoading, isError, error } = usePeriodicElementQuery({ atomicNumber: parseInt(id), language });
  const { elementExpandedSections, setElementExpandedSection } = useAppStore();
  const expandedSections = elementExpandedSections;

  const toggleSection = (section: string) => {
    setElementExpandedSection(section, !elementExpandedSections[section]);
  }


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
          {/* Element Hero */}
          <ElementHero element={element} theme={viewMode} />

          {/* Navigation */}
          <ElementNavigation theme={viewMode}
            previous={element.navigation?.prev ?? undefined}
            next={element.navigation?.next ?? undefined}
            elementStyle={elementStyle}
          />

          {/* Electron View */}
          <ElectronView element={element} />

          {/* Overview Section */}
          <ElementOverview
            element={element}
            atomColor={atomColor}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Notes Section */}
          <ElementNotes
            element={element}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Classifications Section */}
          <ElementClassification
            element={element}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Atomic Dimensions Section */}
          <ElementDimension
            element={element}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Thermal Properties Section */}
          <ElementThermal
            element={element}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Bulk Physical Properties Section */}
          <ElementBulkPhysical
            element={element}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Electrical Properties Section */}
          <ElementElectrical
            element={element}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Magnetic Properties Section */}
          <ElementMagnetic
            element={element}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Abundances Section */}
          <ElementAbundances
            element={element}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Reactivity Section */}
          <ElementReactivity
            element={element}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Health and Safety Section */}
          <ElementHealthSafety
            element={element}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          {/* Nuclear Properties Section */}
          <ElementNuclear
            element={element}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
        </>
      )}
    </div>
  )
}
