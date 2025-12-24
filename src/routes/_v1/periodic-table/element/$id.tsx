import { createFileRoute } from '@tanstack/react-router'
import { usePeriodicElementQuery } from '@/service/periodic-table-api'
import { ElementErrorDisplay, ElementSkeleton, ElementHero } from '@/components/pages/periodic-table/element-details'
import { getPeriodictUnits, elementUnits } from '@/components/pages/periodic-table/utils/element-units'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Info, Thermometer, Ruler, Zap, Activity, Scale, Eye, FlaskConical, Radiation, Waves, HeartPulse, Atom } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/_v1/periodic-table/element/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const {t} = useTranslation();
  const { id } = Route.useParams()
  const { data: element, isLoading, isError, error } = usePeriodicElementQuery({ atomicNumber: parseInt(id) })
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    notes: true,
    classifications: true,
    atomicDimensions: true,
    thermal: true,
    bulkPhysical: true,
    electrical: true,
    magnetic: true,
    abundances: true,
    reactivity: true,
    healthSafety: true,
    nuclear: true
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
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

  return (
    <div className="">
      {element ? (
        <>
          {/* Element Hero */}
          <ElementHero element={element} />

          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Element Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p><strong>Group:</strong> {element.atomicProperties?.group || 'N/A'}</p>
              <p><strong>Period:</strong> {element.atomicProperties?.period || 'N/A'}</p>
              <p><strong>Block:</strong> {element.atomicProperties?.block || 'N/A'}</p>
              <p><strong>Series:</strong> {element.atomicProperties?.series || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Electron Configuration:</strong> {element.atomicProperties?.electronConfiguration || 'N/A'}</p>
              <p><strong>Atomic Radius:</strong> {element.atomicProperties?.atomicRadius || 'N/A'} {getPeriodictUnits('atomRadius')}</p>
              <p><strong>Electronegativity:</strong> {element.atomicProperties?.electronegativity || 'N/A'}</p>
              <p><strong>Valence:</strong> {element.atomicProperties?.valence || 'N/A'}</p>
            </div>
          </div>

          {/* Expandable Sections */}
          <Section
            title="Overview"
            icon={<Info className="h-5 w-5" />}
            isExpanded={expandedSections.overview}
            onToggle={() => toggleSection('overview')}
          >
            {element.notes && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Overview</h3>
                  <p>{element.notes.atomicOverview}</p>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">History</h3>
                  <p>{element.notes.atomicHistory}</p>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Applications</h3>
                  <p>{element.notes.atomicApps}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Facts</h3>
                  <p>{element.notes.atomicFacts}</p>
                </div>
              </>
            )}
          </Section>

          <Section
            title="Notes"
            icon={<Info className="h-5 w-5" />}
            isExpanded={expandedSections.notes}
            onToggle={() => toggleSection('notes')}
          >
            <PropertyItem label="Discovery" value={element.atomicProperties?.discovery} />
            <PropertyItem label="Discovery Year" value={element.atomicProperties?.discoveryYear} />
            <PropertyItem label="Discovery Country" value={element.atomicProperties?.discoveryCountry} />
            <PropertyItem label="Latin Name" value={element.atomicProperties?.latinName} />
            <PropertyItem label="Electron Shell" value={element.atomicProperties?.electronShell} />
          </Section>

          <Section
            title="Classifications"
            icon={<Scale className="h-5 w-5" />}
            isExpanded={expandedSections.classifications}
            onToggle={() => toggleSection('classifications')}
          >
            <PropertyItem label="Alternate Names" value={element.atomicProperties?.alternateNames} />
            <PropertyItem label="Names of Allotropes" value={element.atomicProperties?.namesOfAllotropes} />
            <PropertyItem label="Color" value={element.atomicProperties?.color} />
            <PropertyItem label="Gas Phase" value={element.atomicProperties?.gasPhase} />
            <PropertyItem label="Physical Description" value={element.atomicProperties?.physicalDescription} />
            <PropertyItem label="Ground Level" value={element.atomicProperties?.groundLevel} />
            <PropertyItem label="CAS Number" value={element.atomicProperties?.casNumber} />
            <PropertyItem label="CID Number" value={element.atomicProperties?.cidNumber} />
            <PropertyItem label="InChI" value={element.atomicProperties?.inChI} />
            <PropertyItem label="InChI Key" value={element.atomicProperties?.inChiKey} />
          </Section>

          <Section
            title="Atomic Dimensions & Structure"
            icon={<Ruler className="h-5 w-5" />}
            isExpanded={expandedSections.atomicDimensions}
            onToggle={() => toggleSection('atomicDimensions')}
          >
            <PropertyItem label="Atomic Radius" value={element.atomicProperties?.atomicRadius} unit={getPeriodictUnits('atomRadius')} />
            <PropertyItem label="Covalent Radius" value={element.atomicProperties?.covalentRadius} />
            <PropertyItem label="Van der Waals Radius" value={element.atomicProperties?.vanDerWaalsRadius} unit={getPeriodictUnits('vanDerWaalsRadius')} />
            <PropertyItem label="Crystal Structure" value={element.atomicProperties?.crystalStructure} />
            <PropertyItem label="Lattice Angles" value={element.atomicProperties?.latticeAngles} />
            <PropertyItem label="Lattice Constants" value={element.atomicProperties?.latticeConstants} />
            <PropertyItem label="Space Group Name" value={element.atomicProperties?.spaceGroupName} />
            <PropertyItem label="Space Group Number" value={element.atomicProperties?.spaceGroupNumber} />
            <PropertyItem label="Empirical Atomic Radius" value={element.atomicProperties?.empiricalAtomicRadius} unit={getPeriodictUnits('empiricalAtomicRadius')} />
            <PropertyItem label="Atomic Spectra" value={element.atomicProperties?.atomicSpectra} />
          </Section>

          <Section
            title="Thermal Properties"
            icon={<Thermometer className="h-5 w-5" />}
            isExpanded={expandedSections.thermal}
            onToggle={() => toggleSection('thermal')}
          >
            <PropertyItem label="Phase" value={element.atomicProperties?.phase} />
            <PropertyItem label="Boiling Point" value={element.atomicProperties?.boilingPoint} unit={getPeriodictUnits('celsius')} />
            <PropertyItem label="Melting Point" value={element.atomicProperties?.meltingPoint} unit={getPeriodictUnits('celsius')} />
            <PropertyItem label="Critical Temperature" value={element.atomicProperties?.criticalTemperature} unit="K" />
            <PropertyItem label="Critical Pressure" value={element.atomicProperties?.criticalPressure} unit={getPeriodictUnits('criticalPressure')} />
            <PropertyItem label="Heat of Fusion" value={element.atomicProperties?.heatOfFusion} unit={getPeriodictUnits('heatOfFusion')} />
            <PropertyItem label="Heat of Vaporization" value={element.atomicProperties?.heatOfVaporization} unit={getPeriodictUnits('heatOfVaporization')} />
            <PropertyItem label="Specific Heat" value={element.atomicProperties?.specificHeat} unit={getPeriodictUnits('specificHeat')} />
            <PropertyItem label="Adiabatic Index" value={element.atomicProperties?.adiabaticIndex} />
            <PropertyItem label="Neel Point" value={element.atomicProperties?.neelPoint} unit={getPeriodictUnits('neelPoint')} />
            <PropertyItem label="Thermal Conductivity" value={element.atomicProperties?.thermalConductivity} unit={getPeriodictUnits('thermalConductivity')} />
            <PropertyItem label="Thermal Expansion" value={element.atomicProperties?.thermalExpansion} unit={getPeriodictUnits('thermalExpansion')} />
          </Section>

          <Section
            title="Bulk Physical Properties"
            icon={<Scale className="h-5 w-5" />}
            isExpanded={expandedSections.bulkPhysical}
            onToggle={() => toggleSection('bulkPhysical')}
          >
            <PropertyItem label="Density" value={element.atomicProperties?.density} unit={getPeriodictUnits('density')} />
            <PropertyItem label="Density Liquid" value={element.atomicProperties?.densityLiquid} unit={getPeriodictUnits('density')} />
            <PropertyItem label="Molar Volume" value={element.atomicProperties?.molarVolume} />
            <PropertyItem label="Brinell Hardness" value={element.atomicProperties?.brinellHardness} unit={getPeriodictUnits('brinellHardness')} />
            <PropertyItem label="Mohs Hardness" value={element.atomicProperties?.mohsHardness} />
            <PropertyItem label="Vickers Hardness" value={element.atomicProperties?.vickersHardness} unit={getPeriodictUnits('vickersHardness')} />
            <PropertyItem label="Bulk Modulus" value={element.atomicProperties?.bulkModulus} unit={getPeriodictUnits('bulkModulus')} />
            <PropertyItem label="Shear Modulus" value={element.atomicProperties?.shearModulus} unit={getPeriodictUnits('shearModulus')} />
            <PropertyItem label="Young Modulus" value={element.atomicProperties?.youngModulus} unit={getPeriodictUnits('youngModulus')} />
            <PropertyItem label="Poisson Ratio" value={element.atomicProperties?.poissonRatio} />
            <PropertyItem label="Refractive Index" value={element.atomicProperties?.refractiveIndex} />
            <PropertyItem label="Speed of Sound" value={element.atomicProperties?.speedOfSound} unit={getPeriodictUnits('speedOfSound')} />
          </Section>

          <Section
            title="Electrical Properties"
            icon={<Zap className="h-5 w-5" />}
            isExpanded={expandedSections.electrical}
            onToggle={() => toggleSection('electrical')}
          >
            <PropertyItem label="Electrical Type" value={element.atomicProperties?.electricalType} />
            <PropertyItem label="Electrical Conductivity" value={element.atomicProperties?.electricalConductivity} unit={getPeriodictUnits('electricalConductivity')} />
            <PropertyItem label="Resistivity" value={element.atomicProperties?.resistivity} unit={getPeriodictUnits('resistivity')} />
            <PropertyItem label="Superconducting Point" value={element.atomicProperties?.superconductingPoint} />
          </Section>

          <Section
            title="Magnetic Properties"
            icon={<Waves className="h-5 w-5" />}
            isExpanded={expandedSections.magnetic}
            onToggle={() => toggleSection('magnetic')}
          >
            <PropertyItem label="Magnetic Type" value={element.atomicProperties?.magneticType} />
            <PropertyItem label="Curie Point" value={element.atomicProperties?.curiePoint} unit="K" />
            <PropertyItem label="Mass Magnetic Susceptibility" value={element.atomicProperties?.massMagneticSusceptibility} unit={getPeriodictUnits('molarMagneticSusceptibility')} />
            <PropertyItem label="Molar Magnetic Susceptibility" value={element.atomicProperties?.molarMagneticSusceptibility} unit="m³/mol" />
            <PropertyItem label="Volume Magnetic Susceptibility" value={element.atomicProperties?.volumeMagneticSusceptibility} />
          </Section>

          <Section
            title="Abundances"
            icon={<FlaskConical className="h-5 w-5" />}
            isExpanded={expandedSections.abundances}
            onToggle={() => toggleSection('abundances')}
          >
            <PropertyItem label="% in Universe" value={element.atomicProperties?.percInUniverse} unit="%" />
            <PropertyItem label="% in Sun" value={element.atomicProperties?.percInSun} unit="%" />
            <PropertyItem label="% in Meteorites" value={element.atomicProperties?.percInMeteorites} unit="%" />
            <PropertyItem label="% in Earth's Crust" value={element.atomicProperties?.percInEarthsCrust} unit="%" />
            <PropertyItem label="% in Oceans" value={element.atomicProperties?.percInOceans} unit="%" />
            <PropertyItem label="% in Humans" value={element.atomicProperties?.percInHumans} unit="%" />
            <PropertyItem label="Estimated Crustal Abundance" value={element.atomicProperties?.estimatedCrustalAbundance} unit={getPeriodictUnits('estimatedCrustalAbundance')} />
            <PropertyItem label="Estimated Oceanic Abundance" value={element.atomicProperties?.estimatedOceanicAbundance} unit={getPeriodictUnits('estimatedOceanicAbundance')} />
          </Section>

          <Section
            title="Reactivity"
            icon={<Activity className="h-5 w-5" />}
            isExpanded={expandedSections.reactivity}
            onToggle={() => toggleSection('reactivity')}
          >
            <PropertyItem label="Valence" value={element.atomicProperties?.valence} />
            <PropertyItem label="Electronegativity" value={element.atomicProperties?.electronegativity} />
            <PropertyItem label="Electron Affinity" value={element.atomicProperties?.electronAffinity} unit="kJ/mol" />
            <PropertyItem label="Ionization Energies" value={element.atomicProperties?.ionizationEnergies} unit="kJ/mol" />
            <PropertyItem label="Electronegativity Pauling Scale" value={element.atomicProperties?.electronegativityPaulingScale} />
            <PropertyItem label="Electronegativity Allen Scale" value={element.atomicProperties?.electronegativityAllenScale} />
          </Section>

          <Section
            title="Health & Safety"
            icon={<HeartPulse className="h-5 w-5" />}
            isExpanded={expandedSections.healthSafety}
            onToggle={() => toggleSection('healthSafety')}
          >
            <PropertyItem label="DOT Hazard Class" value={element.atomicProperties?.dOTHazardClass} />
            <PropertyItem label="DOT Numbers" value={element.atomicProperties?.dOTNumbers} />
            <PropertyItem label="RTECS Number" value={element.atomicProperties?.rtecsNumber} />
          </Section>

          <Section
            title="Nuclear Properties"
            icon={<Radiation className="h-5 w-5" />}
            isExpanded={expandedSections.nuclear}
            onToggle={() => toggleSection('nuclear')}
          >
            <PropertyItem label="Half Life" value={element.atomicProperties?.halfLife} />
            <PropertyItem label="Lifetime" value={element.atomicProperties?.lifetime} />
            <PropertyItem label="Decay Mode" value={element.atomicProperties?.decayMode} />
            <PropertyItem label="Quantum Numbers" value={element.atomicProperties?.quantumNumbers} />
            <PropertyItem label="Neutron Cross Section" value={element.atomicProperties?.neutronCrossSection} />
            <PropertyItem label="Neutron Mass Absorption" value={element.atomicProperties?.neutronMassAbsorption} />
            <PropertyItem
              label="Known Isotopes"
              value={
                element.atomicProperties?.getKnownIsotopes
                  ? element.atomicProperties.getKnownIsotopes
                  : element.atomicProperties?.knownIsotopes
                    ? element.atomicProperties.knownIsotopes.join(', ')
                    : undefined
              }
            />
            <PropertyItem
              label="Stable Isotopes"
              value={
                element.atomicProperties?.getStableIsotopes
                  ? element.atomicProperties.getStableIsotopes
                  : element.atomicProperties?.stableIsotopes
                    ? element.atomicProperties.stableIsotopes.join(', ')
                    : undefined
              }
            />
            <PropertyItem
              label="Isotopic Abundances"
              value={
                element.atomicProperties?.getIsotopeAbundance
                  ? element.atomicProperties.getIsotopeAbundance
                  : element.atomicProperties?.isotopicAbundances
                    ? element.atomicProperties.isotopicAbundances.map((iso: any) => `${iso.s}: ${iso.v}%`).join(', ')
                    : undefined
              }
            />
          </Section>
        </>
      ) : (
        <p>Element not found</p>
      )}
    </div>
  )
}

// Helper component for expandable sections
function Section({
  title,
  icon,
  children,
  isExpanded,
  onToggle
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-4 border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-left"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-semibold">{title}</span>
        </div>
        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      {isExpanded && (
        <div className="p-4 bg-white dark:bg-gray-800">
          {children}
        </div>
      )}
    </div>
  )
}

// Helper component for property items
function PropertyItem({ label, value, unit }: { label: string; value?: string | number; unit?: string }) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  return (
    <div className="mb-2">
      <span className="font-medium">{label}:</span> {String(value)} {unit && <span className="text-muted-foreground">{unit}</span>}
    </div>
  )
}