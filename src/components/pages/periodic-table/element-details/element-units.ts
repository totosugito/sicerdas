export const elementUnits = {
    atomicWeight: 'g/mol',
    estimatedCrustalAbundance: 'mg/kg',
    estimatedOceanicAbundance: 'mg/l',
    atomRadius: 'pm',
    celsius: '°C',
    density: 'g/cm³',
    modulus: 'GPa',
    criticalPressure: 'MPa',
    electricalConductivity: 'S/m',
    resistivity: 'Ω·m',
    molarVolume: 'm³/mol',
    shearModulus: 'GPa',
    vanDerWaalsRadius: 'pm',
    empiricalAtomicRadius: 'pm',
    heatOfFusion: 'kJ/mol',
    heatOfVaporization: 'kJ/mol',
    specificHeat: 'J/(kg·K)',
    neelPoint: 'K',
    thermalConductivity: 'W/(m·K)',
    thermalExpansion: 'K⁻¹',
    brinellHardness: 'MPa',
    vickersHardness: 'MPa',
    bulkModulus: 'GPa',
    youngModulus: 'GPa',
    speedOfSound: 'm/s',
}

export const getPeriodictUnits = (element: string) => {
    return elementUnits[element as keyof typeof elementUnits] || ''
}
