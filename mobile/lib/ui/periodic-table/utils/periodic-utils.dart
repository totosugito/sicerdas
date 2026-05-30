import '../../../l10n/gen_l10n/app_localizations.dart';

class PeriodicUtils {
  // Local helper matching React translations using AppLocalizations
  static String getLocalizedLabel(AppLocalizations l10n, String key) {
    switch (key) {
      case 'atomicNumber':
        return l10n.atomicNumber;
      case 'symbol':
        return l10n.symbol;
      case 'name':
        return l10n.name;
      case 'latinName':
        return l10n.latinName;
      case 'discovery':
        return l10n.discovery;
      case 'discoveryYear':
        return l10n.discoveryYear;
      case 'discoveryCountry':
        return l10n.discoveryCountry;
      case 'atomicWeight':
        return l10n.atomicWeight;
      case 'electronShell':
        return l10n.electronShell;
      case 'emissionSpectrum':
        return l10n.emissionSpectrum;
      case 'overview':
        return l10n.periodicOverview;
      case 'classifications':
        return l10n.classifications;
      case 'atomicDimensionsAndStructure':
        return l10n.atomicDimensionsAndStructure;
      case 'thermalProperties':
        return l10n.thermalProperties;
      case 'bulkPhysicalProperties':
        return l10n.bulkPhysicalProperties;
      case 'reactivity':
        return l10n.reactivity;
      case 'healthAndSafety':
        return l10n.healthAndSafety;
      case 'nuclearProperties':
        return l10n.nuclearProperties;
      default:
        return key;
    }
  }

  static String getLocalizedSeries(AppLocalizations l10n, String? series) {
    if (series == null) return "";
    switch (series) {
      case 'nobleGas':
        return l10n.nobleGas;
      case 'halogen':
        return l10n.halogen;
      case 'nonmetal':
        return l10n.nonmetal;
      case 'alkaliMetal':
        return l10n.alkaliMetal;
      case 'alkalineEarthMetal':
        return l10n.alkalineEarthMetal;
      case 'metalloid':
        return l10n.metalloid;
      case 'postTransitionMetal':
        return l10n.postTransitionMetal;
      case 'transitionMetal':
        return l10n.transitionMetal;
      case 'lanthanoid':
        return l10n.lanthanoid;
      case 'actinoid':
        return l10n.actinoid;
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
}
