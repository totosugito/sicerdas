import { APP_CONFIG } from "@/constants/config";

/**
 * Get the URL for an element's image.
 * @param {string} element - The element's with format atomicNumber.atomicName
 * @param {string} type - The type of image (e.g., 'atomic', 'safety', 'spectrum').
 * @returns {string} The URL for the element's image.
 */
export const getElementImage = ({ element, type }: { element: string; type: 'atomic' | 'safety' | 'spectrum' }) => {
  return `${APP_CONFIG.cloud}/bse/table-periodic/${type}/${element.toLowerCase()}.jpg`;
};

