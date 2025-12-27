import { APP_CONFIG } from "@/constants/config";

/**
 * Get the URL for an element's image.
 * @param {string} element - The element's with format atomicNumber.atomicName
 * @param {string} type - The type of image (e.g., 'atomic', 'safety', 'spectrum').
 * @returns {string} The URL for the element's image.
 */
export const getElementImage = ({ element, type, extension='jpg' }: { element: string; type: 'atomic' | 'safety' | 'spectrum', extension?: string }) => {
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
  
  // This could be enhanced to format the electron configuration in a more readable way
  // For now, we just return the raw value
  return electronShell;
};

  export const getDiscoveryYear = (year: string, unit: string) => {
    if (year.startsWith("-")) {
      return (`${year.substring(1)} ${unit}`);
    }
    return (year);
  }

export const getElectronShellValue = (electronShell: string | undefined) => {
  if(!electronShell) {
    return [];
  }
  
  const numbers = electronShell
    .trim()
    .split(/\s+/)
    .map(Number);
  return numbers;
}
