class AtomicProperties {
  final String? name;
  final String? block;
  final String? color;
  final String? group;
  final String? inChI;
  final String? phase;
  final String? period;
  final String? series;
  final String? symbol;
  final String? density;
  final String? valence;
  final String? gasPhase;
  final String? halfLife;
  final String? inChiKey;
  final String? lifetime;
  final String? casNumber;
  final String? cidNumber;
  final String? decayMode;
  final String? discovery;
  final String? latinName;
  final String? neelPoint;
  final List<String>? nfpaLabel;
  final String? percInSun;
  final String? curiePoint;
  final String? dOTNumbers;
  final String? bulkModulus;
  final String? groundLevel;
  final String? molarVolume;
  final String? percInEarth;
  final String? percInEarthsCrust;
  final String? resistivity;
  final String? rtecsNumber;
  final String? atomicNumber;
  final String? atomicRadius;
  final String? atomicWeight;
  final String? boilingPoint;
  final String? heatOfFusion;
  final String? magneticType;
  final String? meltingPoint;
  final String? mohsHardness;
  final String? percInHumans;
  final String? percInOceans;
  final String? poissonRatio;
  final String? shearModulus;
  final String? specificHeat;
  final String? speedOfSound;
  final String? youngModulus;
  final String? atomicSpectra;
  final String? densityLiquid;
  final String? discoveryYear;
  final String? electronShell;
  final List<int>? knownIsotopes;
  final String? latticeAngles;
  final String? adiabaticIndex;
  final String? alternateNames;
  final String? covalentRadius;
  final String? dOTHazardClass;
  final String? electricalType;
  final String? percInUniverse;
  final String? quantumNumbers;
  final String? spaceGroupName;
  final List<int>? stableIsotopes;
  final String? brinellHardness;
  final Map<String, dynamic>? oxidationStates;
  final String? refractiveIndex;
  final String? vickersHardness;
  final String? criticalPressure;
  final String? crystalStructure;
  final String? discoveryCountry;
  final String? electronAffinity;
  final String? emissionSpectrum;
  final String? latticeConstants;
  final int? numberOfElectron;
  final String? numberOfNeutron;
  final String? percInMeteorites;
  final String? spaceGroupNumber;
  final String? thermalExpansion;
  final String? electronegativity;
  final String? namesOfAllotropes;
  final String? vanDerWaalsRadius;
  final String? heatOfVaporization;
  final String? ionizationEnergies;
  final List<dynamic>? isotopicAbundances;
  final String? criticalTemperature;
  final String? neutronCrossSection;
  final String? physicalDescription;
  final String? thermalConductivity;
  final String? absoluteBoilingPoint;
  final String? absoluteMeltingPoint;
  final String? superconductingPoint;
  final String? electronConfiguration;
  final String? empiricalAtomicRadius;
  final String? neutronMassAbsorption;
  final String? electricalConductivity;
  final String? estimatedCrustalAbundance;
  final String? estimatedOceanicAbundance;
  final String? massMagneticSusceptibility;
  final String? electronegativityAllenScale;
  final String? molarMagneticSusceptibility;
  final String? volumeMagneticSusceptibility;
  final String? electronegativityPaulingScale;

  AtomicProperties({
    this.name,
    this.block,
    this.color,
    this.group,
    this.inChI,
    this.phase,
    this.period,
    this.series,
    this.symbol,
    this.density,
    this.valence,
    this.gasPhase,
    this.halfLife,
    this.inChiKey,
    this.lifetime,
    this.casNumber,
    this.cidNumber,
    this.decayMode,
    this.discovery,
    this.latinName,
    this.neelPoint,
    this.nfpaLabel,
    this.percInSun,
    this.curiePoint,
    this.dOTNumbers,
    this.bulkModulus,
    this.groundLevel,
    this.molarVolume,
    this.percInEarth,
    this.percInEarthsCrust,
    this.resistivity,
    this.rtecsNumber,
    this.atomicNumber,
    this.atomicRadius,
    this.atomicWeight,
    this.boilingPoint,
    this.heatOfFusion,
    this.magneticType,
    this.meltingPoint,
    this.mohsHardness,
    this.percInHumans,
    this.percInOceans,
    this.poissonRatio,
    this.shearModulus,
    this.specificHeat,
    this.speedOfSound,
    this.youngModulus,
    this.atomicSpectra,
    this.densityLiquid,
    this.discoveryYear,
    this.electronShell,
    this.knownIsotopes,
    this.latticeAngles,
    this.adiabaticIndex,
    this.alternateNames,
    this.covalentRadius,
    this.dOTHazardClass,
    this.electricalType,
    this.percInUniverse,
    this.quantumNumbers,
    this.spaceGroupName,
    this.stableIsotopes,
    this.brinellHardness,
    this.oxidationStates,
    this.refractiveIndex,
    this.vickersHardness,
    this.criticalPressure,
    this.crystalStructure,
    this.discoveryCountry,
    this.electronAffinity,
    this.emissionSpectrum,
    this.latticeConstants,
    this.numberOfElectron,
    this.numberOfNeutron,
    this.percInMeteorites,
    this.spaceGroupNumber,
    this.thermalExpansion,
    this.electronegativity,
    this.namesOfAllotropes,
    this.vanDerWaalsRadius,
    this.heatOfVaporization,
    this.ionizationEnergies,
    this.isotopicAbundances,
    this.criticalTemperature,
    this.neutronCrossSection,
    this.physicalDescription,
    this.thermalConductivity,
    this.absoluteBoilingPoint,
    this.absoluteMeltingPoint,
    this.superconductingPoint,
    this.electronConfiguration,
    this.empiricalAtomicRadius,
    this.neutronMassAbsorption,
    this.electricalConductivity,
    this.estimatedCrustalAbundance,
    this.estimatedOceanicAbundance,
    this.massMagneticSusceptibility,
    this.electronegativityAllenScale,
    this.molarMagneticSusceptibility,
    this.volumeMagneticSusceptibility,
    this.electronegativityPaulingScale,
  });

  factory AtomicProperties.fromJson(Map<String, dynamic> json) {
    return AtomicProperties(
      name: json['name'] as String?,
      block: json['block'] as String?,
      color: json['color'] as String?,
      group: json['group']?.toString(),
      inChI: json['inChI'] as String?,
      phase: json['phase'] as String?,
      period: json['period']?.toString(),
      series: json['series'] as String?,
      symbol: json['symbol'] as String?,
      density: json['density'] as String?,
      valence: json['valence']?.toString(),
      gasPhase: json['gasPhase'] as String?,
      halfLife: json['halfLife'] as String?,
      inChiKey: json['inChiKey'] as String?,
      lifetime: json['lifetime'] as String?,
      casNumber: json['casNumber'] as String?,
      cidNumber: json['cidNumber']?.toString(),
      decayMode: json['decayMode'] as String?,
      discovery: json['discovery'] as String?,
      latinName: json['latinName'] as String?,
      neelPoint: json['neelPoint'] as String?,
      nfpaLabel: json['nfpaLabel'] != null
          ? List<String>.from(json['nfpaLabel'] as List)
          : null,
      percInSun: json['percInSun'] as String?,
      curiePoint: json['curiePoint'] as String?,
      dOTNumbers: json['dOTNumbers'] as String?,
      bulkModulus: json['bulkModulus'] as String?,
      groundLevel: json['groundLevel'] as String?,
      molarVolume: json['molarVolume'] as String?,
      percInEarth: json['percInEarth'] as String?,
      percInEarthsCrust: json['percInEarthsCrust'] as String?,
      resistivity: json['resistivity'] as String?,
      rtecsNumber: json['rtecsNumber'] as String?,
      atomicNumber: json['atomicNumber']?.toString(),
      atomicRadius: json['atomicRadius'] as String?,
      atomicWeight: json['atomicWeight'] as String?,
      boilingPoint: json['boilingPoint'] as String?,
      heatOfFusion: json['heatOfFusion'] as String?,
      magneticType: json['magneticType'] as String?,
      meltingPoint: json['meltingPoint'] as String?,
      mohsHardness: json['mohsHardness'] as String?,
      percInHumans: json['percInHumans'] as String?,
      percInOceans: json['percInOceans'] as String?,
      poissonRatio: json['poissonRatio'] as String?,
      shearModulus: json['shearModulus'] as String?,
      specificHeat: json['specificHeat'] as String?,
      speedOfSound: json['speedOfSound'] as String?,
      youngModulus: json['youngModulus'] as String?,
      atomicSpectra: json['atomicSpectra'] as String?,
      densityLiquid: json['densityLiquid'] as String?,
      discoveryYear: json['discoveryYear']?.toString(),
      electronShell: json['electronShell'] as String?,
      knownIsotopes: json['knownIsotopes'] != null
          ? List<int>.from(json['knownIsotopes'] as List)
          : null,
      latticeAngles: json['latticeAngles'] as String?,
      adiabaticIndex: json['adiabaticIndex'] as String?,
      alternateNames: json['alternateNames'] as String?,
      covalentRadius: json['covalentRadius'] as String?,
      dOTHazardClass: json['dOTHazardClass'] as String?,
      electricalType: json['electricalType'] as String?,
      percInUniverse: json['percInUniverse'] as String?,
      quantumNumbers: json['quantumNumbers'] as String?,
      spaceGroupName: json['spaceGroupName'] as String?,
      stableIsotopes: json['stableIsotopes'] != null
          ? List<int>.from(json['stableIsotopes'] as List)
          : null,
      brinellHardness: json['brinellHardness'] as String?,
      oxidationStates: json['oxidationStates'] as Map<String, dynamic>?,
      refractiveIndex: json['refractiveIndex'] as String?,
      vickersHardness: json['vickersHardness'] as String?,
      criticalPressure: json['criticalPressure'] as String?,
      crystalStructure: json['crystalStructure'] as String?,
      discoveryCountry: json['discoveryCountry'] as String?,
      electronAffinity: json['electronAffinity'] as String?,
      emissionSpectrum: json['emissionSpectrum'] as String?,
      latticeConstants: json['latticeConstants'] as String?,
      numberOfElectron: json['numberOfElectron'] as int?,
      numberOfNeutron: json['numberOfNeutron']?.toString(),
      percInMeteorites: json['percInMeteorites'] as String?,
      spaceGroupNumber: json['spaceGroupNumber']?.toString(),
      thermalExpansion: json['thermalExpansion'] as String?,
      electronegativity: json['electronegativity'] as String?,
      namesOfAllotropes: json['namesOfAllotropes'] as String?,
      vanDerWaalsRadius: json['vanDerWaalsRadius'] as String?,
      heatOfVaporization: json['heatOfVaporization'] as String?,
      ionizationEnergies: json['ionizationEnergies'] as String?,
      isotopicAbundances: json['isotopicAbundances'] as List<dynamic>?,
      criticalTemperature: json['criticalTemperature'] as String?,
      neutronCrossSection: json['neutronCrossSection']?.toString(),
      physicalDescription: json['physicalDescription'] as String?,
      thermalConductivity: json['thermalConductivity'] as String?,
      absoluteBoilingPoint: json['absoluteBoilingPoint'] as String?,
      absoluteMeltingPoint: json['absoluteMeltingPoint'] as String?,
      superconductingPoint: json['superconductingPoint'] as String?,
      electronConfiguration: json['electronConfiguration'] as String?,
      empiricalAtomicRadius: json['empiricalAtomicRadius'] as String?,
      neutronMassAbsorption: json['neutronMassAbsorption'] as String?,
      electricalConductivity: json['electricalConductivity'] as String?,
      estimatedCrustalAbundance: json['estimatedCrustalAbundance'] as String?,
      estimatedOceanicAbundance: json['estimatedOceanicAbundance'] as String?,
      massMagneticSusceptibility: json['massMagneticSusceptibility'] as String?,
      electronegativityAllenScale: json['electronegativityAllenScale'] as String?,
      molarMagneticSusceptibility: json['molarMagneticSusceptibility'] as String?,
      volumeMagneticSusceptibility: json['volumeMagneticSusceptibility'] as String?,
      electronegativityPaulingScale: json['electronegativityPaulingScale'] as String?,
    );
  }
}

class AtomicImages {
  final String? atomic;
  final String? safety;
  final String? spectrum;

  AtomicImages({this.atomic, this.safety, this.spectrum});

  factory AtomicImages.fromJson(Map<String, dynamic> json) {
    return AtomicImages(
      atomic: json['atomic'] as String?,
      safety: json['safety'] as String?,
      spectrum: json['spectrum'] as String?,
    );
  }
}
