import 'package:path/path.dart' as p;
import 'package:bse/i18n/strings.g.dart';

class PeriodicUtils {
  static const List<String> legendGroups = [
    'othernonmetals',
    'noble_gases',
    'halogens',
    'metalloids',
    'post_transition_metals',
    'transition_metals',
    'lanthanoids',
    'actinoids',
    'alkaline_earth_metals',
    'alkali_metals',
  ];

  static String getAtomImagePath(String baseDir, int atomicNumber) {
    final atomicNumStr = atomicNumber.toString().padLeft(3, '0');
    return p.join(
      baseDir,
      'BSE',
      'Periodic',
      'atomic',
      '$atomicNumStr-atomic.jpg',
    );
  }

  static String getSpectrumImagePath(String baseDir, int atomicNumber) {
    final atomicNumStr = atomicNumber.toString().padLeft(3, '0');
    return p.join(
      baseDir,
      'BSE',
      'Periodic',
      'spectrum',
      '$atomicNumStr-spectrum.png',
    );
  }

  // Local helper matching React translations using Translations
  static String getLocalizedLabel(Translations l10n, String key) {
    switch (key) {
      case 'atomicNumber':
        return l10n.periodic_table.atomicNumber;
      case 'symbol':
        return l10n.periodic_table.symbol;
      case 'name':
        return l10n.periodic_table.name;
      case 'latinName':
        return l10n.periodic_table.latinName;
      case 'discovery':
        return l10n.periodic_table.discovery;
      case 'discoveryYear':
        return l10n.periodic_table.discoveryYear;
      case 'discoveryCountry':
        return l10n.periodic_table.discoveryCountry;
      case 'atomicWeight':
        return l10n.periodic_table.atomicWeight;
      case 'electronShell':
        return l10n.periodic_table.electronShell;
      case 'emissionSpectrum':
        return l10n.periodic_table.emissionSpectrum;
      case 'overview':
        return l10n.periodic_table.sections.overview;
      case 'classifications':
        return l10n.periodic_table.classifications;
      case 'atomicDimensionsAndStructure':
        return l10n.periodic_table.atomicDimensionsAndStructure;
      case 'thermalProperties':
        return l10n.periodic_table.thermalProperties;
      case 'bulkPhysicalProperties':
        return l10n.periodic_table.bulkPhysicalProperties;
      case 'reactivity':
        return l10n.periodic_table.reactivity;
      case 'healthAndSafety':
        return l10n.periodic_table.healthAndSafety;
      case 'nuclearProperties':
        return l10n.periodic_table.nuclearProperties;
      default:
        return key;
    }
  }

  static String getLocalizedSeries(Translations l10n, String? series) {
    if (series == null) return "";
    switch (series) {
      case 'nobleGas':
      case 'noble_gases':
      case 'noblegases':
        return l10n.periodic_table.nobleGas;
      case 'halogen':
      case 'halogens':
        return l10n.periodic_table.halogen;
      case 'nonmetal':
      case 'othernonmetals':
      case 'other_nonmetals':
        return l10n.periodic_table.nonmetal;
      case 'alkaliMetal':
      case 'alkali_metals':
      case 'alkalimetals':
        return l10n.periodic_table.alkaliMetal;
      case 'alkalineEarthMetal':
      case 'alkaline_earth_metals':
      case 'alkalineearthmetals':
        return l10n.periodic_table.alkalineEarthMetal;
      case 'metalloid':
      case 'metalloids':
        return l10n.periodic_table.metalloid;
      case 'postTransitionMetal':
      case 'post_transition_metals':
      case 'posttransitionmetals':
        return l10n.periodic_table.postTransitionMetal;
      case 'transitionMetal':
      case 'transition_metals':
      case 'transitionmetals':
        return l10n.periodic_table.transitionMetal;
      case 'lanthanoid':
      case 'lanthanoids':
      case 'lanthanides':
        return l10n.periodic_table.lanthanoid;
      case 'actinoid':
      case 'actinoids':
      case 'actinides':
        return l10n.periodic_table.actinoid;
      default:
        return series;
    }
  }

  static double celsiusToFahrenheit(double c) => (c * 1.8) + 32;
  static double celsiusToKelvin(double c) => 273.15 + c;
  static double kelvinToCelsius(double k) => k - 273.15;
  static double kelvinToFahrenheit(double k) => k * 1.8 - 459.67;

  static String celsiusToOther(double celsius) {
    if (celsius.isNaN) return "";
    final f = celsiusToFahrenheit(celsius);
    final k = celsiusToKelvin(celsius);
    return "${celsius.toStringAsFixed(2)} °C = ${f.toStringAsFixed(2)} °F = ${k.toStringAsFixed(2)} K";
  }

  static String kelvinToOther(double kelvin) {
    if (kelvin.isNaN) return "";
    final c = kelvinToCelsius(kelvin);
    final f = kelvinToFahrenheit(kelvin);
    return "${c.toStringAsFixed(2)} °C = ${f.toStringAsFixed(2)} °F = ${kelvin.toStringAsFixed(2)} K";
  }

  // toPhysics converts numbers to exponential form with superscripts
  static String toPhysics(double value, {int precision = -1}) {
    if (value.isNaN) {
      return 'N/A';
    }
    if (value == 0) return '0';

    final absValue = value.abs();
    if (absValue < 1e-5 || absValue > 1e+5) {
      final formattedString = value.toStringAsExponential();
      final parts = formattedString.split('e');
      if (parts.length == 2) {
        final mantissa = double.parse(parts[0]);
        final exponent = int.parse(parts[1]);
        return precision < 0
            ? '${mantissa.toStringAsFixed(2)} × 10<sup>$exponent</sup>'
            : '${mantissa.toStringAsFixed(precision)} × 10<sup>$exponent</sup>';
      }
    }
    return precision < 0 ? '$value' : value.toStringAsFixed(precision);
  }

  static String getDiscoveryYear(String year, String bcUnit) {
    if (year.startsWith("-")) {
      return '${year.substring(1)} $bcUnit';
    }
    return year;
  }

  static String? getElectronShell(String? electronShell) {
    if (electronShell == null || electronShell.isEmpty) {
      return null;
    }

    final key = ["K", "L", "M", "N", "O", "P", "Q", "R"];
    final values = electronShell.split(" ");

    var result = "";
    for (var i = 0; i < values.length; i++) {
      if (i < key.length) {
        result = "$result${key[i]}${values[i].trim()} ";
      }
    }

    return result.trim();
  }

  static List<int> getElectronShellValue(String? electronShell) {
    if (electronShell == null || electronShell.trim().isEmpty) {
      return [];
    }
    return electronShell
        .trim()
        .split(RegExp(r'\s+'))
        .map((s) => int.tryParse(s) ?? 0)
        .toList();
  }

  static String getColumnGroup(String group, {String separator = ' / '}) {
    const groupMap = {
      "1": "1A",
      "2": "2A",
      "3": "3B",
      "4": "4B",
      "5": "5B",
      "6": "6B",
      "7": "7B",
      "8": "8B",
      "9": "8B",
      "10": "8B",
      "11": "1B",
      "12": "2B",
      "13": "3A",
      "14": "4A",
      "15": "5A",
      "16": "6A",
      "17": "7A",
      "18": "8A",
    };
    final gr = groupMap[group];
    if (gr == null) return "";
    return separator + gr;
  }

  static String getPeriodicUnits(String key) {
    const elementUnits = {
      'atomicWeight': 'g/mol',
      'estimatedCrustalAbundance': 'mg/kg',
      'estimatedOceanicAbundance': 'mg/l',
      'atomRadius': 'pm',
      'celsius': '°C',
      'density': 'g/cm³',
      'modulus': 'GPa',
      'criticalPressure': 'MPa',
      'electricalConductivity': 'S/m',
      'resistivity': 'Ω·m',
      'molarVolume': 'm³/mol',
      'shearModulus': 'GPa',
      'vanDerWaalsRadius': 'pm',
      'empiricalAtomicRadius': 'pm',
      'heatOfFusion': 'kJ/mol',
      'heatOfVaporization': 'kJ/mol',
      'specificHeat': 'J/(kg·K)',
      'neelPoint': 'K',
      'thermalConductivity': 'W/(m·K)',
      'thermalExpansion': 'K⁻¹',
      'brinellHardness': 'MPa',
      'vickersHardness': 'MPa',
      'mohsHardness': 'Mohs',
      'bulkModulus': 'GPa',
      'youngModulus': 'GPa',
      'speedOfSound': 'm/s',
      'curiePoint': 'K',
      'massMagneticSusceptibility': 'm³/Kg',
      'molarMagneticSusceptibility': 'm³/mol',
      'electronAffinity': 'kJ/mol',
      'ionizationEnergies': 'kJ/mol',
    };
    return elementUnits[key] ?? '';
  }

  static String getElementUrl(int atomicNumber) {
    return 'https://sicerdas.com/periodic/element/$atomicNumber';
  }
}
