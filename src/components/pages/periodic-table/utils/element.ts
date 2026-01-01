import { APP_CONFIG } from "@/constants/config";
import { toPhysics } from "@/lib/my-utils";

/**
 * Get the URL for an element's image.
 * @param {string} element - The element's with format atomicNumber.atomicName
 * @param {string} type - The type of image (e.g., 'atomic', 'safety', 'spectrum').
 * @returns {string} The URL for the element's image.
 */
export const getElementImage = ({ element, type, extension = 'jpg' }: { element: string; type: 'atomic' | 'safety' | 'spectrum', extension?: string }) => {
  return `${APP_CONFIG.cloud}/bse/table-periodic/${type}/${element.toLowerCase()}.${extension}`;
};

/**
 * Format the electron shell property for display.
 * @param {string | undefined} electronShell - The electron shell string from the element properties
 * @returns {string | undefined} The formatted electron shell string
 */
export const getElectronShell = (electronShell: string | undefined): string | undefined => {
  if (!electronShell) {
    return undefined;
  }

  const key_ = ["K", "L", "M", "N", "O", "P", "Q", "R"];
  const default_ = ["0", "0", "0", "0", "0", "0", "0", "0"];
  const value_ = electronShell.split(" ");

  for (let i = 0; i < value_.length; i++) {
    default_[i] = value_[i].trim();
  }

  let result = "";
  for (let i = 0; i < key_.length; i++) {
    result = `${result}${key_[i]}${default_[i]} `;
  }

  return result.trim();
};

export const getDiscoveryYear = (year: string, unit: string) => {
  if (year.startsWith("-")) {
    return (`${year.substring(1)} ${unit}`);
  }
  return (year);
}

export const getElectronShellValue = (electronShell: string | undefined) => {
  if (!electronShell) {
    return [];
  }

  const numbers = electronShell
    .trim()
    .split(/\s+/)
    .map(Number);
  return numbers;
}

// Temperature units
export const unitDegreesCelsius = "°C";
export const unitDegreesFahrenheit = "°F";
export const unitKelvin = "K";

/**
 * Convert Celsius to Kelvin
 * @param celsius Temperature in Celsius
 * @returns Temperature in Kelvin
 */
export const celsiusToKelvin = (celsius: number): number => 273.15 + celsius;

/**
 * Convert Fahrenheit to Kelvin
 * @param fahrenheit Temperature in Fahrenheit
 * @returns Temperature in Kelvin
 */
export const fahrenheitToKelvin = (fahrenheit: number): number => (fahrenheit + 459.67) * 5 / 9;

/**
 * Convert Kelvin to Celsius
 * @param kelvin Temperature in Kelvin
 * @returns Temperature in Celsius
 */
export const kelvinToCelsius = (kelvin: number): number => kelvin - 273.15;

/**
 * Convert Kelvin to Fahrenheit
 * @param kelvin Temperature in Kelvin
 * @returns Temperature in Fahrenheit
 */
export const kelvinToFahrenheit = (kelvin: number): number => kelvin * 1.8 - 459.67;

/**
 * Convert Celsius to Fahrenheit
 * @param celsius Temperature in Celsius
 * @returns Temperature in Fahrenheit
 */
export const celsiusToFahrenheit = (celsius: number): number => (celsius * 1.8) + 32;

/**
 * Convert Fahrenheit to Celsius
 * @param fahrenheit Temperature in Fahrenheit
 * @returns Temperature in Celsius
 */
export const fahrenheitToCelsius = (fahrenheit: number): number => (fahrenheit - 32) * 5 / 9;

/**
 * Format a temperature value with its unit
 * @param value Temperature value
 * @param unit Temperature unit
 * @param precision Number of decimal places
 * @returns Formatted temperature string
 */
const doubleToString = (value: number, unit: string, precision: number): string => {
  if (isNaN(value)) {
    return "";
  }
  return `${value.toFixed(precision)} ${unit}`;
};

/**
 * Format Celsius temperature with all equivalent units
 * @param celsius Temperature in Celsius
 * @returns Formatted string with all temperature units
 */
export const celsiusToOther = (celsius: number): string => {
  if (isNaN(celsius)) {
    return "";
  }

  const fahrenheit = celsiusToFahrenheit(celsius);
  const kelvin = celsiusToKelvin(celsius);
  return (
    `${doubleToString(celsius, unitDegreesCelsius, 2)} = ` +
    `${doubleToString(fahrenheit, unitDegreesFahrenheit, 2)} = ` +
    `${doubleToString(kelvin, unitKelvin, 2)}`
  );
};

/**
 * Format Kelvin temperature with all equivalent units
 * @param kelvin Temperature in Kelvin
 * @returns Formatted string with all temperature units
 */
export const kelvinToOther = (kelvin: number): string => {
  if (isNaN(kelvin)) {
    return "";
  }

  const fahrenheit = kelvinToFahrenheit(kelvin);
  const celsius = kelvinToCelsius(kelvin);
  return (
    `${doubleToString(celsius, unitDegreesCelsius, 2)} = ` +
    `${doubleToString(fahrenheit, unitDegreesFahrenheit, 2)} = ` +
    `${doubleToString(kelvin, unitKelvin, 2)}`
  );
};

/**
 * Parse a string to a number
 * @param s String to parse
 * @returns Parsed number
 */
export const stringToDouble = (s: string): number => parseFloat(s);

/**
 * Format isotope abundance list as HTML string
 * @param symbols_ Element symbol
 * @param idxList List of isotope abundance objects with s (mass number) and v (value) properties
 * @returns HTML string with formatted isotope abundances
 */
export const getIsotopeAbundance = (symbols_: string, idxList: Array<{ s: number, v: number }> | undefined): string => {
  if (!idxList || idxList.length === 0) {
    return "";
  }

  const idxLength = idxList.length;
  let s = "";
  for (let i = 0; i < idxLength; i++) {
    const m = idxList[i];
    s = `${s}<sup><small>${m.s}</small></sup>${symbols_} (${toPhysics({ value: m.v })} %)`;
    if (i < idxLength - 1) {
      s = `${s}, `;
    }
  }
  return s;
};

/**
 * Create atom isotope tag as HTML string
 * @param symbols_ Element symbol
 * @param idxList List of isotope mass numbers
 * @returns HTML string with formatted isotope tags
 */
export const createAtomIsotopeTag = (symbols_: string, idxList: number[] | undefined): string => {
  const idxLength = idxList?.length || 0;
  if (!idxList || idxLength === 0) {
    return "";
  }

  let s = "";
  for (let i = 0; i < idxLength; i++) {
    s = `${s}<sup><small>${idxList[i]}</small></sup>${symbols_}`;
    if (i < idxLength - 1) {
      s = `${s}, `;
    }
  }
  return s;
};

export const getColumnGroup = (group: string, separator = ' / ') => {
  const group_ = {
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
  const gr = group_[group as keyof typeof group_];
  if (!gr) return "";
  return (separator + gr)
}